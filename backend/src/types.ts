import { Static } from "@sinclair/typebox";

import * as Schemas from "./schemas";

export type Word = Static<typeof Schemas.Word>;
export type Device = Static<typeof Schemas.Device>;
export type Game = Static<typeof Schemas.Game>;
export type Clue = Static<typeof Schemas.Clue>;
export type Shot = Static<typeof Schemas.Shot>;

export type GameCreate = Static<typeof Schemas.GameCreate>;
export type GameUpdate = Static<typeof Schemas.GameUpdate>;
export type ClueCreate = Static<typeof Schemas.ClueCreate>;
export type ClueUpdate = Static<typeof Schemas.ClueUpdate>;
export type ShotCreate = Static<typeof Schemas.ShotCreate>;

export type WordChoice = Static<typeof Schemas.WordChoice>;
