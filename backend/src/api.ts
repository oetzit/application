import { FastifyPluginCallback } from "fastify";

import { Static, Type } from "@sinclair/typebox";

import { connection } from "./db";

import * as Types from "./types";
import * as Schemas from "./schemas";

// NOTE: refer to https://cloud.google.com/apis/design/
// NOTE: see https://www.npmjs.com/package/fastify-plugin for TS plugin definition

const IdInParamsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
});

type IdInParamsType = Static<typeof IdInParamsSchema>;

//==============================================================================

const apiPlugin: FastifyPluginCallback = (fastify, options, next) => {
  fastify.route<{
    Reply: Types.Word;
  }>({
    method: "GET",
    url: "/word",
    schema: {
      response: {
        200: Schemas.Word,
        404: {}, // TODO: JSend error
      },
    },
    handler: async (request, reply) => {
      // TODO: scope this to game to avoid collisions
      const word = await connection<Types.Word>("words")
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
    Params: IdInParamsType;
    Reply: Types.Game;
  }>({
    method: "GET",
    url: "/games/:id",
    schema: {
      params: IdInParamsSchema,
      response: {
        200: Schemas.Game,
        404: {}, // TODO: JSend error
      },
    },
    handler: async (request, reply) => {
      const game = await connection<Types.Game>("games")
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
    Reply: Types.Game;
  }>({
    method: "POST",
    url: "/games",
    schema: {
      response: {
        200: Schemas.Game,
      },
    },
    handler: async (request, reply) => {
      const games = await connection
        .table("games")
        .insert({})
        .returning<Types.Game[]>("*");

      reply.code(200).send(games[0]);
    },
  });

  fastify.route<{
    Params: IdInParamsType;
    Body: Types.GameUpdate;
    Reply: Types.Game;
  }>({
    method: "PATCH",
    url: "/games/:id",
    schema: {
      params: IdInParamsSchema,
      body: Schemas.GameUpdate,
      response: {
        200: Schemas.Game,
      },
    },
    handler: async (request, reply) => {
      const game = await connection<Types.Game>("games")
        .where("id", request.params.id)
        .first();
      if (game === undefined) {
        reply.code(404).send();
      } else {
        const games = await connection<Types.Game>("games")
          .update(request.body)
          .returning("*");
        reply.code(200).send(games[0]);
      }
    },
  });

  fastify.route<{
    Params: IdInParamsType;
    Body: Types.ClueCreate;
    Reply: Types.Clue;
  }>({
    method: "POST",
    url: "/games/:id/clues",
    schema: {
      params: IdInParamsSchema,
      body: Schemas.ClueCreate,
      response: {
        200: Schemas.Clue,
      },
    },
    handler: async (request, reply) => {
      const clues = await connection
        .table("clues")
        .insert(request.body)
        .returning<Types.Clue[]>("*");

      reply.code(200).send(clues[0]);
    },
  });

  fastify.route<{
    Params: IdInParamsType;
    Body: Types.ClueUpdate;
    Reply: Types.Clue;
  }>({
    method: "PATCH",
    url: "/clues/:id",
    schema: {
      params: IdInParamsSchema,
      body: Schemas.ClueUpdate,
      response: {
        200: Schemas.Clue,
      },
    },
    handler: async (request, reply) => {
      const clue = await connection<Types.Clue>("clues")
        .where("id", request.params.id)
        .first();
      if (clue === undefined) {
        reply.code(404).send();
      } else {
        const clues = await connection<Types.Clue>("clues")
          .update(request.body)
          .returning("*");
        reply.code(200).send(clues[0]);
      }
    },
  });

  fastify.route<{
    Params: IdInParamsType;
    Body: Types.ShotCreate;
    Reply: Types.Shot;
  }>({
    method: "POST",
    url: "/games/:id/shots",
    schema: {
      params: IdInParamsSchema,
      body: Schemas.ShotCreate,
      response: {
        200: Schemas.Shot,
      },
    },
    handler: async (request, reply) => {
      const shots = await connection
        .table("shots")
        .insert(request.body)
        .returning<Types.Shot[]>("*");

      reply.code(200).send(shots[0]);
    },
  });

  next();
};

export default apiPlugin;
