import fastify from "fastify";
import fastifyAuth from "@fastify/auth";
import fastifyBasicAuth from "@fastify/basic-auth";
import fastifyCors from "fastify-cors";
import fastifySwagger from "fastify-swagger";
import fastifyRollbar from "./rollbar_plugin";

const server = fastify({
  logger: {
    prettyPrint: {
      // TODO: disable in prod
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
    },
  },
});

server.register(fastifyRollbar);

server.register(fastifyCors, {
  // TODO: use the correct origins
  origin: "*",
});

server.register(fastifySwagger, {
  exposeRoute: true,
  routePrefix: "/api/doc",
  swagger: {
    info: {
      title: "Ötzit!",
      description: "Ötzit! backend API",
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

server.register(fastifyAuth);
server.register(fastifyBasicAuth, {
  authenticate: true,
  validate: async function (username, password) {
    const user = process.env.DASHBOARD_USERNAME;
    const pass = process.env.DASHBOARD_PASSWORD;
    const userKo = !user || user !== username;
    const passKo = !pass || pass !== password;
    if (userKo || passKo) return new Error("Unauthorized");
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

import dashboardRoutes from "./dashboard";
server.register(dashboardRoutes);

// TODO: this is an horrible kludge
import fastifyStatic from "fastify-static";
import path from "path";
server.register(fastifyStatic, {
  root: path.join(__dirname, "../public"),
  prefix: "/public/",
});

server.listen(process.env.PORT as string, "0.0.0.0");
