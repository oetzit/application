import fastify from "fastify";
import fastifyCors from "fastify-cors";

const server = fastify({
  logger: false,
});

server.register(fastifyCors, {
  // TODO: use the correct origins
  origin: "*",
});

server.get("/", function (request, reply) {
  reply.code(200).send("Hello, World!");
});

server.route({
  method: "POST",
  url: "/GetImage",
  schema: {
    body: {
      type: "object",
      properties: {
        sessionImages: {
          type: "array",
          items: { type: "number" },
        },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "number" },
          image: { type: "string" },
        },
      },
    },
  },
  handler: function (request, reply) {
    reply.send({
      id: 0,
      image:
        "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAA3SURBVBhXYyAXeHh43AeDhIQEqBAEAIX+g8H379+hQhAAlwACqBAEVFRUQESnT58OFSIRMDAAABZDJ2qjC6hLAAAAAElFTkSuQmCC",
    });
  },
});

server.listen(process.env.PORT as string, "0.0.0.0", function (err, address) {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  server.log.info(`server listening on ${address}`);
});
