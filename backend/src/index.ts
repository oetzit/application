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

server.get("/", function (request, reply) {
  reply.code(200).send("Hello, World!");
});

server.listen(process.env.PORT as string, "0.0.0.0");
