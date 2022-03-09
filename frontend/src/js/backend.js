import axios from "axios";

// import path from "path";
// const endpointURL = (endpoint) =>
//   new URL(path.join(BACKEND_URL.pathname, endpoint), BACKEND_URL);

const BACKEND_URL = new URL(process.env.BACKEND_URL);

const backend = axios.create({
  baseURL: BACKEND_URL.toString(),
});

export default backend;
