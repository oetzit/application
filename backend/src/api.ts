import { FastifyPluginCallback } from "fastify";
import { Static, Type } from "@sinclair/typebox";

import { connection } from "./db";

// NOTE: see https://www.npmjs.com/package/fastify-plugin for TS plugin definition

const IdInParamsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
});

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

//==============================================================================

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
    Params: Static<typeof IdInParamsSchema>;
    Reply: GameType;
  }>({
    method: "GET",
    url: "/games/:id",
    schema: {
      params: IdInParamsSchema,
      response: {
        200: GameSchema,
        404: {}, // TODO: JSend error
      },
    },
    handler: async (request, reply) => {
      const game = await connection<GameType>("games")
        .where("id", request.params.id)
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
    Params: Static<typeof IdInParamsSchema>;
    Body: Static<typeof GamePatchSchema>;
    Reply: GameType;
  }>({
    method: "PATCH",
    url: "/games/:id",
    schema: {
      params: IdInParamsSchema,
      body: GamePatchSchema,
      response: {
        200: GameSchema,
      },
    },
    handler: async (request, reply) => {
      const game = await connection<GameType>("games")
        .where("id", request.params.id)
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
    Params: Static<typeof IdInParamsSchema>;
    Body: Static<typeof CluePostSchema>;
    Reply: ClueType;
  }>({
    method: "POST",
    url: "/games/:id/clues",
    schema: {
      params: IdInParamsSchema,
      body: CluePostSchema,
      response: {
        200: ClueSchema,
      },
    },
    handler: async (request, reply) => {
      const clues = await connection
        .table("clues")
        .insert(request.body)
        .returning<ClueType[]>("*");

      reply.code(200).send(clues[0]);
    },
  });

  fastify.route<{
    Params: Static<typeof IdInParamsSchema>;
    Body: Static<typeof CluePatchSchema>;
    Reply: ClueType;
  }>({
    method: "PATCH",
    url: "/clues/:id",
    schema: {
      params: IdInParamsSchema,
      body: CluePatchSchema,
      response: {
        200: ClueSchema,
      },
    },
    handler: async (request, reply) => {
      const clue = await connection<ClueType>("clues")
        .where("id", request.params.id)
        .first();
      if (clue === undefined) {
        reply.code(404).send();
      } else {
        const clues = await connection<ClueType>("clues")
          .update(request.body)
          .returning("*");
        reply.code(200).send(clues[0]);
      }
    },
  });

  fastify.route<{
    Params: Static<typeof IdInParamsSchema>;
    Body: Static<typeof ShotPostSchema>;
    Reply: ShotType;
  }>({
    method: "POST",
    url: "/games/:id/shots",
    schema: {
      params: IdInParamsSchema,
      body: ShotPostSchema,
      response: {
        200: ShotSchema,
      },
    },
    handler: async (request, reply) => {
      const shots = await connection
        .table("shots")
        .insert(request.body)
        .returning<ShotType[]>("*");

      reply.code(200).send(shots[0]);
    },
  });

  next();
};

export default apiPlugin;
