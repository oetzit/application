import axios from "axios";

// TODO: either move the rootDir or share this
import * as Types from "../../../backend/src/types";

// import path from "path";
// const endpointURL = (endpoint) =>
//   new URL(path.join(BACKEND_URL.pathname, endpoint), BACKEND_URL);

// TODO: raise an error if env var is missing
const BACKEND_URL = new URL(process.env.BACKEND_URL ?? "");
const STORAGE_URL = new URL(process.env.STORAGE_URL ?? "");

const backend = axios.create({
  baseURL: BACKEND_URL.toString(),
});

const storage = axios.create({
  baseURL: STORAGE_URL.toString(),
  responseType: "arraybuffer",
});

export default {
  createDevice: () => backend.post<Types.Device>("/api/devices"),
  getDevice: (deviceId: string) =>
    backend.get<Types.Device>(`/api/devices/${deviceId}`),
  updateDevice: (deviceId: string, data: Types.DeviceUpdate) =>
    backend.patch<Types.Device>(`/api/devices/${deviceId}`, data),
  createLeaderboardView: (data: Types.LeaderboardQuery) =>
    backend.post<Types.LeaderboardSafeItem[]>("/api/devices/leaderboard", data),
  createWordChoice: (data: Types.WordChoice) =>
    backend.post<Types.Word>("/api/words/choice", data),
  createGame: (deviceId: string, data: Types.GameCreate) =>
    backend.post<Types.Game>(`/api/devices/${deviceId}/games`, data),
  updateGame: (gameId: string, data: Types.GameUpdate) =>
    backend.patch<Types.Game>(`/api/games/${gameId}`, data),
  createClue: (gameId: string, data: Types.ClueCreate) =>
    backend.post<Types.Clue>(`/api/games/${gameId}/clues`, data),
  updateClue: (clueId: string, data: Types.ClueUpdate) =>
    backend.patch<Types.Clue>(`/api/clues/${clueId}`, data),
  createShot: (gameId: string, data: Types.ShotCreate) =>
    backend.post<Types.Shot>(`/api/games/${gameId}/shots`, data),
  getWordImage: (pageId: string, wordId: string) =>
    storage.get(`/${pageId}/${wordId}.png`),
};
