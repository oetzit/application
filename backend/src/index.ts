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

  const gamesCount = (await connection.table("games").count())[0].count;
  const cluesCount = (await connection.table("clues").count())[0].count;
  const shotsCount = (await connection.table("shots").count())[0].count;

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
        "width_bucket(extract(epoch from ended_at - began_at)*1000, 0, 60*1000, 60*10)*100 as bucket, count(*)",
      ),
    )
    .groupBy("bucket")
    .orderBy("bucket");

  reply.view("/templates/dashboard.ejs", {
    gamesCount,
    cluesCount,
    shotsCount,
    gamesByDate,
    shotsByDuration,
  });
});

// TODO: this is an horrible kludge
import fastifyStatic from "fastify-static";
import path from "path";
import { connect } from "http2";
server.register(fastifyStatic, {
  root: path.join(__dirname, "../public"),
  prefix: "/public/",
});

server.listen(process.env.PORT as string, "0.0.0.0");
