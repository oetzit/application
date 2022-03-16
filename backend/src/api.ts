import { FastifyPluginCallback } from "fastify";
import { FromSchema } from "json-schema-to-ts";

import { connection } from "./db";

// NOTE: see https://www.npmjs.com/package/fastify-plugin for TS plugin definition

const ParamsSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      format: "uuid",
    },
  },
  required: ["id"],
} as const;

const GameSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      format: "uuid",
    },
  },
  required: ["id"],
} as const;

const WordSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    image: { type: "string" },
    ocr_confidence: { type: "number", minimum: 0, maximum: 1 },
    ocr_transcript: { type: "string" },
  },
  required: ["id"],
} as const;

const apiPlugin: FastifyPluginCallback = (fastify, options, next) => {
  fastify.route<{
    Reply: FromSchema<typeof WordSchema>;
  }>({
    method: "GET",
    url: "/word",
    schema: {
      response: {
        200: WordSchema,
        404: {}, // TODO: JSend error
      },
    },
    handler: async (request, reply) => {
      // TODO: scope this to game to avoid collisions
      const word = await connection<FromSchema<typeof WordSchema>>("words")
        .whereBetween("ocr_confidence", [0.4, 0.8]) // i.e. needs improvement but it's not trash
        .whereRaw(`"ocr_transcript" ~ '^[[:alpha:]]+$'`) // i.e. no numbers nor symbols
        .orderByRaw("RANDOM()")
        .first();
      if (word === undefined) {
        reply.code(404).send();
      } else {
        reply.code(200).send({
          id: word.id,
          image: word.image,
          ocr_confidence: word.ocr_confidence,
          ocr_transcript: word.ocr_transcript,
        });
      }
    },
  });

  fastify.route<{
    Params: FromSchema<typeof ParamsSchema>;
    Reply: FromSchema<typeof GameSchema>;
  }>({
    method: "GET",
    url: "/games/:id",
    schema: {
      params: ParamsSchema,
      response: {
        200: GameSchema,
        404: {}, // TODO: JSend error
      },
    },
    handler: async (request, reply) => {
      const game = await connection<FromSchema<typeof GameSchema>>("games")
        .where("id", request.params.id)
        .first();
      if (game === undefined) {
        reply.code(404).send();
      } else {
        reply.code(200).send({
          id: game.id,
        });
      }
    },
  });

  next();
};

export default apiPlugin;
