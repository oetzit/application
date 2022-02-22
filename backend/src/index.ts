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

server.listen(process.env.PORT as string, "0.0.0.0", function (err, address) {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  server.log.info(`server listening on ${address}`);
});
