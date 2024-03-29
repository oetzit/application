import { Type, TSchema, TUnion, TNull } from "@sinclair/typebox";

function Nullable<T extends TSchema>(schema: T): TUnion<[T, TNull]> {
  return { ...schema, nullable: true } as any;
}

export const Word = Type.Object({
  id: Type.String({ format: "uuid" }),
  page_id: Type.String(),
  word_id: Type.String(),
  ocr_confidence: Type.Number({ minimum: 0, maximum: 1 }),
  ocr_transcript: Type.String(),
});

export const Device = Type.Object({
  id: Type.Readonly(Type.String({ format: "uuid" })),
  email: Nullable(Type.String({ format: "email" })),
});
export const DeviceUpdate = Type.Partial(Type.Pick(Device, ["email"]));

export const Game = Type.Object({
  id: Type.Readonly(Type.String({ format: "uuid" })),
  device_id: Type.Readonly(Type.String({ format: "uuid" })),
  began_at: Nullable(Type.String({ format: "date-time" })),
  ended_at: Nullable(Type.String({ format: "date-time" })),
  began_at_gmtm: Nullable(Type.Number({ minimum: 0 })),
  ended_at_gmtm: Nullable(Type.Number({ minimum: 0 })),
  score: Nullable(Type.Integer()),
});

export const Clue = Type.Object({
  id: Type.Readonly(Type.String({ format: "uuid" })),
  game_id: Type.Readonly(Type.String({ format: "uuid" })),
  word_id: Type.Readonly(Type.String({ format: "uuid" })),
  began_at: Nullable(Type.String({ format: "date-time" })),
  ended_at: Nullable(Type.String({ format: "date-time" })),
  began_at_gmtm: Nullable(Type.Number({ minimum: 0 })),
  ended_at_gmtm: Nullable(Type.Number({ minimum: 0 })),
});

export const Shot = Type.Object({
  id: Type.Readonly(Type.String({ format: "uuid" })),
  game_id: Type.Readonly(Type.String({ format: "uuid" })),
  clue_id: Nullable(Type.String({ format: "uuid" })),
  began_at: Type.String({ format: "date-time" }),
  ended_at: Type.String({ format: "date-time" }),
  began_at_gmtm: Nullable(Type.Number({ minimum: 0 })),
  ended_at_gmtm: Nullable(Type.Number({ minimum: 0 })),
  typed: Type.String(),
  final: Type.String(),
  score: Type.Integer(),
  similarity: Type.Number(),
});

export const GameUpdate = Type.Partial(
  Type.Pick(Game, [
    "began_at",
    "ended_at",
    "began_at_gmtm",
    "ended_at_gmtm",
    "score",
  ]),
);
export const GameCreate = GameUpdate;

export const ClueUpdate = Type.Partial(
  Type.Pick(Clue, ["began_at", "ended_at", "began_at_gmtm", "ended_at_gmtm"]),
);
export const ClueCreate = Type.Intersect([
  Type.Pick(Clue, ["word_id"]),
  ClueUpdate,
]);

export const ShotCreate = Type.Omit(Shot, ["id", "game_id"]);

export const WordChoice = Type.Object({
  ocr_confidence_min: Type.Number({
    minimum: 0.0,
    default: 0.4,
    maximum: 1.0,
  }),
  ocr_confidence_max: Type.Number({
    minimum: 0.0,
    default: 0.8,
    maximum: 1.0,
  }),
  ocr_transcript_length_min: Type.Integer({ minimum: 1, default: 1 }),
  ocr_transcript_length_max: Type.Integer({ minimum: 1, default: 20 }),
});

export const LeaderboardQuery = Type.Object({
  device_id: Type.Optional(Type.String({ format: "uuid" })),
});

export const LeaderboardItem = Type.Object({
  place: Type.Integer({ minimum: 1 }),
  device_id: Type.String({ format: "uuid" }),
  game_score: Type.Integer(),
});

export const LeaderboardView = Type.Array(LeaderboardItem);

export const LeaderboardSafeItem = Type.Object({
  place: Type.Integer({ minimum: 1 }),
  device_hash: Type.String({ pattern: "^[0-9a-z]{64}$" }),
  game_score: Type.Integer(),
});

export const LeaderboardSafeView = Type.Array(LeaderboardSafeItem);
