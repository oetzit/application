import fastify from "fastify";
import fastifyCors from "fastify-cors";
import { connection } from "./db";
import { FromSchema } from "json-schema-to-ts";

const server = fastify({
  logger: {
    prettyPrint: {
      // TODO: disable in prod
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
    },
  },
});

server.register(fastifyCors, {
  // TODO: use the correct origins
  origin: "*",
});

server.get("/", function (request, reply) {
  reply.code(200).send("Hello, World!");
});

server.route({
  method: "POST",
  url: "/GetImage",
  schema: {
    // body: {},
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          image: { type: "string" },
          ocr_confidence: { type: "number", minimum: 0, maximum: 1 },
          ocr_transcript: { type: "string" },
        },
      },
    },
  },
  handler: async function (request, reply) {
    // TODO: skip images already used in current game (overkill? we prolly have thousands so collisions should be irrelevant...)
    const word = await connection
      .table("words")
      .whereBetween("ocr_confidence", [0.4, 0.8]) // i.e. needs improvement but it's not trash
      .whereRaw(`"ocr_transcript" ~ '^[[:alpha:]]+$'`) // i.e. no numbers nor symbols
      .orderByRaw("RANDOM()")
      .first();
    reply.send({
      id: word.id,
      image: word.image,
      ocr_confidence: word.ocr_confidence,
      ocr_transcript: word.ocr_transcript,
    });
  },
});

//=[ CheckTranscription ]=======================================================

const CheckTranscriptionBodySchema = {
  type: "object",
  properties: {
    deltaTime: { type: "number" },
    refData: {
      type: "object",
      properties: {
        id: { type: "number" },
        image: { type: "string" },
      },
      required: ["id", "image"],
    },
    transcription: { type: "string" },
  },
  required: ["deltaTime", "refData", "transcription"],
} as const;

server.route<{ Body: FromSchema<typeof CheckTranscriptionBodySchema> }>({
  method: "POST",
  url: "/CheckTranscription",
  schema: {
    body: CheckTranscriptionBodySchema,
    response: {
      200: {
        type: "object",
        properties: {
          hitTheTarget: { type: "boolean" },
        },
      },
    },
  },
  handler: async function (request, reply) {
    // TODO: actually check the word
    await connection.table("game_results").insert({
      id_image: request.body.refData.id,
      transcription: request.body.transcription,
      gametime: request.body.deltaTime,
    });
    reply.send({
      hitTheTarget: true,
    });
  },
});

server.listen(process.env.PORT as string, "0.0.0.0");
