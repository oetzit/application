import axios from "axios";

// import path from "path";
// const endpointURL = (endpoint) =>
//   new URL(path.join(BACKEND_URL.pathname, endpoint), BACKEND_URL);

// TODO: raise an error if env var is missing
const BACKEND_URL = new URL(process.env.BACKEND_URL ?? "");

const backend = axios.create({
  baseURL: BACKEND_URL.toString(),
});

export default backend;
