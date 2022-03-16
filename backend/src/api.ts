import { FastifyPluginCallback } from "fastify";
import { Static, Type } from "@sinclair/typebox";

import { connection } from "./db";

// NOTE: see https://www.npmjs.com/package/fastify-plugin for TS plugin definition

const GameParamsSchema = Type.Object({
  game_id: Type.String({ format: "uuid" }),
});

type GameParamsType = Static<typeof GameParamsSchema>;

const ClueParamsSchema = Type.Object({
  game_id: Type.String({ format: "uuid" }),
  clue_id: Type.String({ format: "uuid" }),
});

type ClueParamsType = Static<typeof ClueParamsSchema>;

const ClueSchema = Type.Object({
  id: Type.Readonly(Type.String({ format: "uuid" })),
  game_id: Type.Readonly(Type.String({ format: "uuid" })),
  word_id: Type.Readonly(Type.String({ format: "uuid" })),
  began_at: Type.Optional(Type.String({ format: "date-time" })),
  ended_at: Type.Optional(Type.String({ format: "date-time" })),
});

const CluePostSchema = Type.Pick(ClueSchema, ["game_id", "word_id"]);
const CluePatchSchema = Type.Pick(ClueSchema, ["began_at", "ended_at"]);

type ClueType = Static<typeof ClueSchema>;

const ShotSchema = Type.Object({
  id: Type.Readonly(Type.String({ format: "uuid" })),
  game_id: Type.Readonly(Type.String({ format: "uuid" })),
  clue_id: Type.Optional(Type.Readonly(Type.String({ format: "uuid" }))),
  began_at: Type.String({ format: "date-time" }),
  ended_at: Type.String({ format: "date-time" }),
  typed: Type.String(),
  final: Type.String(),
});

const ShotPostSchema = Type.Omit(ShotSchema, ["id"]);

type ShotType = Static<typeof ShotSchema>;

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
    Params: GameParamsType;
    Reply: GameType;
  }>({
    method: "GET",
    url: "/games/:game_id",
    schema: {
      params: GameParamsSchema,
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
    Params: GameParamsType;
    Body: Static<typeof GamePatchSchema>;
    Reply: GameType;
  }>({
    method: "PATCH",
    url: "/games/:game_id",
    schema: {
      params: GameParamsSchema,
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

  fastify.route<{
    Params: Static<typeof GameParamsSchema>;
    Body: Static<typeof CluePostSchema>;
    Reply: ClueType;
  }>({
    method: "POST",
    url: "/games/:game_id/clues",
    schema: {
      params: GameParamsSchema,
      body: CluePostSchema,
      response: {
        200: ClueSchema,
      },
    },
    handler: async (request, reply) => {},
  });

  fastify.route<{
    Params: Static<typeof ClueParamsSchema>;
    Body: Static<typeof CluePatchSchema>;
    Reply: ClueType;
  }>({
    method: "PATCH",
    url: "/games/:game_id/clues/:clue_id",
    schema: {
      params: ClueParamsSchema,
      body: CluePatchSchema,
      response: {
        200: ClueSchema,
      },
    },
    handler: async (request, reply) => {},
  });

  fastify.route<{
    Params: Static<typeof GameParamsSchema>;
    Body: Static<typeof ShotPostSchema>;
    Reply: ShotType;
  }>({
    method: "POST",
    url: "/games/:game_id/shots",
    schema: {
      params: GameParamsSchema,
      body: ShotPostSchema,
      response: {
        200: ShotSchema,
      },
    },
    handler: async (request, reply) => {},
  });

  next();
};

export default apiPlugin;
