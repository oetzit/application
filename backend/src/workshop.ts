import { FastifyPluginCallback } from "fastify";

import * as Types from "./types";

import { connection } from "./db";

// NOTE: refer to https://cloud.google.com/apis/design/
// NOTE: see https://www.npmjs.com/package/fastify-plugin for TS plugin definition

//==============================================================================

const workshopPlugin: FastifyPluginCallback = (fastify, options, next) => {
  fastify.route<{
    Querystring: { mail: string };
  }>({
    method: "GET",
    url: "/",
    preHandler: fastify.auth([fastify.basicAuth]),
    handler: async (request, reply) => {
      const { mail } = request.query;

      const scoresByDevice = await connection
        .table("games")
        .select(
          connection.raw(
            "device_id, MAX(score) as max_score, SUM(score) as sum_score, array_agg(score) as all_scores, count(*) as games_count, email",
          ),
        )
        .join("devices", "devices.id", "games.device_id")
        .whereNotNull("score")
        .where("devices.email", "ilike", `%@${mail}`)
        .orderBy("max_score", "desc")
        .groupBy(["device_id", "devices.email"]);

      const transcriptions = connection
        .table("words")
        .select(
          connection.raw(
            "words.page_id, words.word_id, words.id, lower(words.ocr_transcript) as ocr, words.ocr_confidence, lower(shots.final) as usr, count(shots.id)",
          ),
        )
        .join("clues", "words.id", "clues.word_id")
        .join("shots", "clues.id", "shots.clue_id")
        .join("games", "games.id", "shots.game_id")
        .join("devices", "devices.id", "games.device_id")
        .where("devices.email", "ilike", `%@${mail}`)
        .groupBy(connection.raw("words.id, lower(shots.final)"));

      const transcriptionsAggregates = connection
        .select(
          connection.raw(
            "id, page_id, word_id, sum(count) as usr_tot, array_agg(count) as usr_counts, json_object_agg(usr, count) as usr_transcripts, ocr as ocr_transcript, ocr_confidence",
          ),
        )
        .from(transcriptions.as("t"))
        .groupBy(connection.raw("id, page_id, word_id, ocr, ocr_confidence"));

      const transcriptionsEntropy = await connection
        .select(
          connection.raw(
            "id, page_id, word_id, usr_tot, usr_counts, (select sum(-(n::float/usr_tot)*log(n::float/usr_tot)) from unnest(usr_counts) as n) as usr_entropy, ocr_transcript, ocr_confidence, usr_transcripts",
          ),
        )
        .from(transcriptionsAggregates.as("ta"))
        .orderByRaw(connection.raw("usr_entropy DESC"));

      // TODO: this is awful, but better than writing throwaway SQL
      let transcriptionsTotalCount = 0;
      let transcriptionsConfirmedCount = 0;
      let transcriptionsImprovedCount = 0;
      let transcriptionsPendingCount = 0;
      transcriptionsEntropy.forEach((w: any) => {
        transcriptionsTotalCount += 1;
        w.usr_counts.sort((a: number, b: number) => b - a); // NOTE: sorts in place
        const fitness = (w.usr_counts[0] - (w.usr_counts[1] || 0)) / w.usr_tot;
        w.fitness = fitness;
        if (fitness >= 0.5) {
          const [topKey, topVal] = Object.entries(
            w.usr_transcripts as { [k: string]: number },
          ).sort((x, y) => y[1] - x[1])[0];

          if (w.ocr_transcript == topKey) {
            transcriptionsConfirmedCount++;
            w.status = "confirmed";
          } else {
            transcriptionsImprovedCount++;
            w.status = "improved";
          }
        } else {
          transcriptionsPendingCount++;
          w.status = "pending";
        }
      });

      reply.view("/templates/workshop.ejs", {
        mail,
        appVersion: process.env.APP_VERSION || "unknown",
        scoresByDevice,
        transcriptionsTotalCount,
        transcriptionsConfirmedCount,
        transcriptionsImprovedCount,
        transcriptionsPendingCount,
        transcriptionsEntropy,
      });
    },
  });

  next();
};

export default workshopPlugin;
