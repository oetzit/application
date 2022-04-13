import fastify from "fastify";
import fastifyCors from "fastify-cors";
import fastifySwagger from "fastify-swagger";

const server = fastify({
  logger: {
    prettyPrint: {
      // TODO: disable in prod
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
    },
  },
});

server.register(fastifyCors, {
  // TODO: use the correct origins
  origin: "*",
});

server.register(fastifySwagger, {
  exposeRoute: true,
  routePrefix: "/api/doc",
  swagger: {
    info: {
      title: "Ötzi",
      description: "Ötzi app backend API",
      version: "0.1.0",
    },
    host: "localhost:8080",
    schemes: ["http", "https"],
    consumes: ["application/json"],
    produces: ["application/json"],
    tags: [],
    definitions: {},
    // securityDefinitions: {
    //   apiKey: {
    //     type: "apiKey",
    //     name: "apiKey",
    //     in: "header",
    //   },
    // },
  },
});

import apiRoutes from "./api";
server.register(apiRoutes, { prefix: "api" });

import pointOfView from "point-of-view";
import * as ejs from "ejs";
server.register(pointOfView, {
  engine: { ejs: ejs },
  defaultContext: {
    env: "TODO", // TODO: env and tag/sha
  },
});

import { connection } from "./db";

server.get("/", async (request, reply) => {
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
      connection.raw("COUNT(*), DATE(began_at), ended_at IS NOT NULL as ended"),
    )
    .groupByRaw("DATE(began_at), ended");

  const shotsByDuration = await connection
    .table("shots")
    .select(
      connection.raw(
        "width_bucket(ended_at_gmtm - began_at_gmtm, 0, 60*1000, 60*5)*200 as bucket, count(*)",
      ),
    )
    .groupBy("bucket")
    .orderBy("bucket");

  reply.view("/templates/dashboard.ejs", {
    appVersion: process.env.APP_VERSION || "unknown",
    devicesCount,
    gamesCount,
    cluesCount,
    shotsCount,
    devicesByDate,
    gamesByDate,
    shotsByDuration,
    devicesBehaviour,
    wordsPerformance,
  });
});

// TODO: this is an horrible kludge
import fastifyStatic from "fastify-static";
import path from "path";
server.register(fastifyStatic, {
  root: path.join(__dirname, "../public"),
  prefix: "/public/",
});

server.listen(process.env.PORT as string, "0.0.0.0");
