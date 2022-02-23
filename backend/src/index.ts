import fastify from "fastify";
import fastifyCors from "fastify-cors";
import { connection } from "./db";
import { FromSchema } from "json-schema-to-ts";

const server = fastify({
  logger: false,
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
    body: {
      type: "object",
      properties: {
        sessionImages: {
          type: "array",
          items: { type: "number" },
        },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "number" },
          image: { type: "string" },
        },
      },
    },
  },
  handler: async function (request, reply) {
    // TODO: skip images already used in current game
    const image = await connection
      .table("images")
      .orderByRaw("RANDOM()")
      .first();
    reply.send({
      id: image.id,
      image: image.image,
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
  handler: function (request, reply) {
    reply.send({
      hitTheTarget: true,
    });
  },
});

server.listen(process.env.PORT as string, "0.0.0.0", function (err, address) {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  server.log.info(`server listening on ${address}`);
});
