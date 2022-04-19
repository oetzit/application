import Rollbar from "rollbar";

const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  // verbose: true,
  captureUncaught: true,
  captureUnhandledRejections: true,
  enabled: !(process.env.NODE_ENV === "development"),
  payload: {
    environment: process.env.NODE_ENV,
    server: {
      branch: process.env.APP_VERSION,
      // host: "",
      // root: "",
    },
  },
});

import fp from "fastify-plugin";
import { FastifyPluginCallback } from "fastify";

const rollbarConnector: FastifyPluginCallback = (fastify, _options, done) => {
  const defaultHandler = fastify.errorHandler;
  fastify.setErrorHandler((error, request, reply) => {
    defaultHandler(error, request, reply);
    rollbar.error(error);
  });
  // fastify.decorate('Rollbar', rollbar);
  done();
};

export default fp(rollbarConnector);
