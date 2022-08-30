import { FastifyPluginCallback } from "fastify";

import { connection } from "./db";

// NOTE: refer to https://cloud.google.com/apis/design/
// NOTE: see https://www.npmjs.com/package/fastify-plugin for TS plugin definition

//==============================================================================

const dashboardPlugin: FastifyPluginCallback = (fastify, options, next) => {
  fastify.route({
    method: "GET",
    url: "/",
    preHandler: fastify.auth([fastify.basicAuth]),
    handler: async (request, reply) => {
      // reply.code(200).send("Hello, World!");

      const devicesCount = (await connection.table("devices").count())[0].count;
      const gamesCount = (await connection.table("games").count())[0].count;
      const cluesCount = (await connection.table("clues").count())[0].count;
      const shotsCount = (await connection.table("shots").count())[0].count;

      const normalizedGames = connection
        .table("games")
        .select(
          connection.raw(
            "games.id, games.device_id, games.began_at_gmtm, games.ended_at_gmtm, max(shots.ended_at_gmtm) as last_shot_ended_at_gmtm",
          ),
        )
        .fullOuterJoin("shots", "games.id", "shots.game_id")
        .groupBy("games.id");

      const devicesBehaviour = await connection
        .select(
          connection.raw(
            "sum(coalesce (ended_at_gmtm, last_shot_ended_at_gmtm) - began_at_gmtm) as time_spent, count(case when ended_at_gmtm is not null then 1 end) as ended_count, count(case when ended_at_gmtm is null then 1 end) as interrupted_count, device_id",
          ),
        )
        .from(normalizedGames.as("g"))
        .groupBy("device_id");

      const wordsPerformance = await connection
        .select(
          connection.raw(
            "words.id, words.ocr_transcript, words.ocr_confidence, AVG(shots.similarity) as avg_similarity",
          ),
        )
        .from("shots")
        .join("clues", "clues.id", "shots.clue_id")
        .join("words", "words.id", "clues.word_id")
        .whereNotNull("shots.similarity")
        .groupBy("words.id");

      const devicesByDate = await connection
        .table("games")
        .select(connection.raw("COUNT(DISTINCT device_id), DATE(began_at)"))
        .whereNotNull("device_id")
        .groupByRaw("DATE(began_at)");

      const gamesByDate = await connection
        .table("games")
        .select(
          connection.raw(
            "COUNT(*), DATE(began_at), ended_at IS NOT NULL as ended",
          ),
        )
        .groupByRaw("DATE(began_at), ended");

      const transcriptions = connection
        .table("words")
        .select(
          connection.raw(
            "words.page_id, words.word_id, words.id, lower(words.ocr_transcript) as ocr, words.ocr_confidence, lower(shots.final) as usr, count(shots.id)",
          ),
        )
        .join("clues", "words.id", "clues.word_id")
        .join("shots", "clues.id", "shots.clue_id")
        .groupBy(connection.raw("words.id, lower(shots.final)"));

      const transcriptionsConfirmed = connection
        .select(
          connection.raw("distinct on (t.id) t.id, t.count, t.usr, t.ocr"),
        )
        .from(transcriptions.as("t"))
        .where(connection.raw("t.usr = t.ocr AND t.count > 2"))
        .orderBy("t.id", "t.count DESC");

      const transcriptionsImproved = connection
        .select(
          connection.raw("distinct on (t.id) t.id, t.count, t.usr, t.ocr"),
        )
        .from(transcriptions.as("t"))
        .where(connection.raw("t.usr != t.ocr AND t.count > 2"))
        .orderBy("t.id", "t.count DESC");

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

      const transcriptionsTotalCount = (
        await connection.from(transcriptions.as("t")).count()
      )[0].count;
      const transcriptionsConfirmedCount = (
        await connection.from(transcriptionsConfirmed.as("tc")).count()
      )[0].count;
      const transcriptionsImprovedCount = (
        await connection.from(transcriptionsImproved.as("ti")).count()
      )[0].count;
      const transcriptionsPendingCount = // TODO: this conversion is ridiculous
        parseInt(transcriptionsTotalCount.toString()) -
        parseInt(transcriptionsConfirmedCount.toString()) -
        parseInt(transcriptionsImprovedCount.toString());

      const cluesByDuration = await connection
        .table("clues")
        .select(
          connection.raw(
            "width_bucket(ended_at_gmtm - began_at_gmtm, 0, 150*100, 100)*150 as bucket, count(*)",
          ),
        )
        .groupBy("bucket")
        .orderBy("bucket");

      const shotsByDuration = await connection
        .table("shots")
        .select(
          connection.raw(
            "width_bucket(ended_at_gmtm - began_at_gmtm, 0, 10*1000, 100)*100 as bucket, count(*)",
          ),
        )
        .groupBy("bucket")
        .orderBy("bucket");

      const shotsBySimilarity = await connection
        .table("shots")
        .select(
          connection.raw(
            "width_bucket(similarity, 0, 1, 9)*0.1 as bucket, count(*)",
          ),
        )
        // .whereNot("similarity", -1)
        .groupBy("bucket")
        .orderBy("bucket");

      const bestWeeklyScoresByDevice = connection
        .table("games")
        .select(
          connection.raw(
            "device_id, DATE_PART('week', ended_at) as week, MAX(score) as best_score",
          ),
        )
        .whereNotNull("score")
        .groupBy("device_id", "week");

      const rankedWeeklyScoresByDevice = connection
        .select(
          connection.raw(
            "*, RANK() OVER(PARTITION BY week ORDER BY best_score DESC) as week_rank",
          ),
        )
        .from(bestWeeklyScoresByDevice.as("g"));

      const topWeeklyPlayers = await connection
        .select("ranked.*", "devices.email")
        .from(rankedWeeklyScoresByDevice.as("ranked"))
        .join("devices", "devices.id", "ranked.device_id")
        .where("week_rank", "<=", 3)
        .orderBy("week", "desc")
        .orderBy("week_rank", "asc");

      reply.view("/templates/dashboard.ejs", {
        appVersion: process.env.APP_VERSION || "unknown",
        devicesCount,
        gamesCount,
        cluesCount,
        shotsCount,
        devicesByDate,
        gamesByDate,
        transcriptionsTotalCount,
        transcriptionsConfirmedCount,
        transcriptionsImprovedCount,
        transcriptionsPendingCount,
        transcriptionsEntropy,
        cluesByDuration,
        shotsByDuration,
        shotsBySimilarity,
        devicesBehaviour,
        wordsPerformance,
        topWeeklyPlayers,
      });
    },
  });

  next();
};

export default dashboardPlugin;
