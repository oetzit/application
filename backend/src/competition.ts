import { FastifyPluginCallback } from "fastify";

import { connection } from "./db";

// NOTE: refer to https://cloud.google.com/apis/design/
// NOTE: see https://www.npmjs.com/package/fastify-plugin for TS plugin definition

//==============================================================================

const competitionPlugin: FastifyPluginCallback = (fastify, options, next) => {
  fastify.route({
    method: "GET",
    url: "/",
    preHandler: fastify.auth([fastify.basicAuth]),
    handler: async (request, reply) => {
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
        // .where("week_rank", "<=", 10)
        .where("devices.email", "IS NOT", null)
        .orderBy("week", "desc")
        .orderBy("week_rank", "asc");

      reply.view("/templates/competition.ejs", {
        appVersion: process.env.APP_VERSION || "unknown",
        topWeeklyPlayers,
      });
    },
  });

  next();
};

export default competitionPlugin;
