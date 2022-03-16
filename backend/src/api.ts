import { FastifyPluginCallback } from "fastify";
import { Static, Type } from "@sinclair/typebox";

import { connection } from "./db";

// NOTE: see https://www.npmjs.com/package/fastify-plugin for TS plugin definition

const ParamsSchema = Type.Object({
  game_id: Type.String({ format: "uuid" }),
});

type ParamsType = Static<typeof ParamsSchema>;

const GameSchema = Type.Object({
  id: Type.Readonly(Type.String({ format: "uuid" })),
  began_at: Type.Optional(Type.String({ format: "date-time" })),
  ended_at: Type.Optional(Type.String({ format: "date-time" })),
});

type GameType = Static<typeof GameSchema>;

const GamePatchSchema = Type.Omit(GameSchema, ["id"]);

const WordSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  image: Type.String(),
  ocr_confidence: Type.Number({ minimum: 0, maximum: 1 }),
  ocr_transcript: Type.String(),
});

type WordType = Static<typeof WordSchema>;

const apiPlugin: FastifyPluginCallback = (fastify, options, next) => {
  fastify.route<{
    Reply: WordType;
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
      const word = await connection<WordType>("words")
        .whereBetween("ocr_confidence", [0.4, 0.8]) // i.e. needs improvement but it's not trash
        .whereRaw(`"ocr_transcript" ~ '^[[:alpha:]]+$'`) // i.e. no numbers nor symbols
        .orderByRaw("RANDOM()")
        .first();
      if (word === undefined) {
        reply.code(404).send();
      } else {
        reply.code(200).send(word);
      }
    },
  });

  fastify.route<{
    Params: ParamsType;
    Reply: GameType;
  }>({
    method: "GET",
    url: "/games/:game_id",
    schema: {
      params: ParamsSchema,
      response: {
        200: GameSchema,
        404: {}, // TODO: JSend error
      },
    },
    handler: async (request, reply) => {
      const game = await connection<GameType>("games")
        .where("id", request.params.game_id)
        .first();
      if (game === undefined) {
        reply.code(404).send();
      } else {
        reply.code(200).send(game);
      }
    },
  });

  fastify.route<{
    Reply: GameType;
  }>({
    method: "POST",
    url: "/games",
    schema: {
      response: {
        200: GameSchema,
      },
    },
    handler: async (request, reply) => {
      const games = await connection
        .table("games")
        .insert({})
        .returning<GameType[]>("*");

      reply.code(200).send(games[0]);
    },
  });

  fastify.route<{
    Params: ParamsType;
    Body: Static<typeof GamePatchSchema>;
    Reply: GameType;
  }>({
    method: "PATCH",
    url: "/games/:game_id",
    schema: {
      params: ParamsSchema,
      body: GamePatchSchema,
      response: {
        200: GameSchema,
      },
    },
    handler: async (request, reply) => {
      const game = await connection<GameType>("games")
        .where("id", request.params.game_id)
        .first();
      if (game === undefined) {
        reply.code(404).send();
      } else {
        const games = await connection<GameType>("games")
          .update(request.body)
          .returning("*");
        reply.code(200).send(games[0]);
      }
    },
  });

  next();
};

export default apiPlugin;
