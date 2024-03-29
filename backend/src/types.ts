import { Static } from "@sinclair/typebox";

import * as Schemas from "./schemas";

export type Device = Static<typeof Schemas.Device>;
export type DeviceUpdate = Static<typeof Schemas.DeviceUpdate>;

export type Game = Static<typeof Schemas.Game>;
export type GameCreate = Static<typeof Schemas.GameCreate>;
export type GameUpdate = Static<typeof Schemas.GameUpdate>;

export type Clue = Static<typeof Schemas.Clue>;
export type ClueCreate = Static<typeof Schemas.ClueCreate>;
export type ClueUpdate = Static<typeof Schemas.ClueUpdate>;

export type Shot = Static<typeof Schemas.Shot>;
export type ShotCreate = Static<typeof Schemas.ShotCreate>;

export type Word = Static<typeof Schemas.Word>;
export type WordChoice = Static<typeof Schemas.WordChoice>;

export type LeaderboardQuery = Static<typeof Schemas.LeaderboardQuery>;
export type LeaderboardItem = Static<typeof Schemas.LeaderboardItem>;
export type LeaderboardView = Static<typeof Schemas.LeaderboardView>;
export type LeaderboardSafeItem = Static<typeof Schemas.LeaderboardSafeItem>;
export type LeaderboardSafeView = Static<typeof Schemas.LeaderboardSafeView>;
