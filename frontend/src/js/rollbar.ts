import * as Rollbar from "rollbar";

new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  // verbose: true,
  captureUncaught: true,
  captureUnhandledRejections: true,
  enabled: !(process.env.NODE_ENV === "development"),
  payload: {
    environment: process.env.NODE_ENV,
    client: {
      javascript: {
        code_version: process.env.APP_VERSION,
        source_map_enabled: true,
        guess_uncaught_frames: true,
      },
    },
  },
});
