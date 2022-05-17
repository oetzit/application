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
    Body: Types.WordChoice;
    Reply: Types.Word;
  }>({
    method: "POST",
    url: "/words/choice",
    schema: {
      body: Schemas.WordChoice,
      response: {
        200: Schemas.Word,
        404: {}, // TODO: JSend error
      },
    },
    handler: async (request, reply) => {
      const ocrConfidenceRange: readonly [number, number] = [
        request.body.ocr_confidence_min,
        request.body.ocr_confidence_max,
      ];
      const ocrTranscriptLengthRange: readonly [number, number] = [
        request.body.ocr_transcript_length_min,
        request.body.ocr_transcript_length_max,
      ];
      const ocrTranscriptRegex =
        "^[[:alpha:]]{" + ocrTranscriptLengthRange.join(",") + "}$";

      // TODO: scope this to game to avoid collisions
      const word = await connection<Types.Word>("words")
        .whereBetween("ocr_confidence", ocrConfidenceRange)
        .where("ocr_transcript", "~", ocrTranscriptRegex)
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
    Reply: Types.Device;
  }>({
    method: "GET",
    url: "/devices/:id",
    schema: {
      params: IdInParamsSchema,
      response: {
        200: Schemas.Device,
        404: {}, // TODO: JSend error
      },
    },
    handler: async (request, reply) => {
      const device = await connection<Types.Device>("devices")
        .where("id", request.params.id)
        .first();
      if (device === undefined) {
        reply.code(404).send();
      } else {
        reply.code(200).send(device);
      }
    },
  });

  fastify.route<{
    Body: Types.LeaderboardQuery;
    Reply: Types.LeaderboardView;
  }>({
    method: "POST",
    url: "/devices/leaderboard",
    schema: {
      body: Schemas.LeaderboardQuery,
      response: {
        200: Schemas.LeaderboardView,
      },
    },
    handler: async (request, reply) => {
      const leaderboardView: Types.LeaderboardView = await connection
        .select(
          connection.raw(
            "ROW_NUMBER() OVER(ORDER BY MAX(score) DESC) AS place, device_id, max(score) AS game_score",
          ),
        )
        .from("games")
        .whereNotNull("score")
        .groupBy<Types.LeaderboardView>("device_id")
        .orderBy("game_score", "DESC");

      const deviceIndex = leaderboardView.findIndex(
        ({ device_id }) => device_id == request.body.device_id,
      );

      const filteredLeaderboardView = leaderboardView.filter(
        ({ place }, index) => place < 4 || Math.abs(deviceIndex - index) < 2,
      );

      reply.code(200).send(filteredLeaderboardView);
    },
  });

  fastify.route<{
    Body: Types.LeaderboardView;
    Reply: Types.Device;
  }>({
    method: "POST",
    url: "/devices",
    schema: {
      response: {
        200: Schemas.Device,
      },
    },
    handler: async (request, reply) => {
      const devices = await connection
        .table("devices")
        .insert({})
        .returning<Types.Device[]>("*");

      reply.code(200).send(devices[0]);
    },
  });

  fastify.route<{
    Params: IdInParamsType;
    Body: Types.DeviceUpdate;
    Reply: Types.Device;
  }>({
    method: "PATCH",
    url: "/devices/:id",
    schema: {
      params: IdInParamsSchema,
      body: Schemas.DeviceUpdate,
      response: {
        200: Schemas.Device,
      },
    },
    handler: async (request, reply) => {
      const devices = await connection<Types.Device>("devices")
        .where("id", request.params.id)
        .update(request.body)
        .returning("*");
      reply.code(200).send(devices[0]);
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
    Params: IdInParamsType;
    Body: Types.GameCreate;
    Reply: Types.Game;
  }>({
    method: "POST",
    url: "/devices/:id/games",
    schema: {
      params: IdInParamsSchema,
      body: Schemas.GameCreate,
      response: {
        200: Schemas.Game,
      },
    },
    handler: async (request, reply) => {
      const games = await connection
        .table("games")
        .insert({ device_id: request.params.id, ...request.body })
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
      const games = await connection<Types.Game>("games")
        .where("id", request.params.id)
        .update(request.body)
        .returning("*");
      reply.code(200).send(games[0]);
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
        .insert({ game_id: request.params.id, ...request.body })
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
      const clues = await connection<Types.Clue>("clues")
        .where("id", request.params.id)
        .update(request.body)
        .returning("*");
      reply.code(200).send(clues[0]);
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
        .insert({ game_id: request.params.id, ...request.body })
        .returning<Types.Shot[]>("*");

      reply.code(200).send(shots[0]);
    },
  });

  next();
};

export default apiPlugin;
