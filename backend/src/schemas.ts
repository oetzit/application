import { Type, TSchema, TUnion, TNull } from "@sinclair/typebox";

function Nullable<T extends TSchema>(schema: T): TUnion<[T, TNull]> {
  return { ...schema, nullable: true } as any;
}

export const Word = Type.Object({
  id: Type.String({ format: "uuid" }),
  image: Type.String(),
  ocr_confidence: Type.Number({ minimum: 0, maximum: 1 }),
  ocr_transcript: Type.String(),
});

export const Game = Type.Object({
  id: Type.Readonly(Type.String({ format: "uuid" })),
  began_at: Nullable(Type.String({ format: "date-time" })),
  ended_at: Nullable(Type.String({ format: "date-time" })),
});

export const Clue = Type.Object({
  id: Type.Readonly(Type.String({ format: "uuid" })),
  game_id: Type.Readonly(Type.String({ format: "uuid" })),
  word_id: Type.Readonly(Type.String({ format: "uuid" })),
  began_at: Nullable(Type.String({ format: "date-time" })),
  ended_at: Nullable(Type.String({ format: "date-time" })),
});

export const Shot = Type.Object({
  id: Type.Readonly(Type.String({ format: "uuid" })),
  game_id: Type.Readonly(Type.String({ format: "uuid" })),
  clue_id: Nullable(Type.String({ format: "uuid" })),
  began_at: Type.String({ format: "date-time" }),
  ended_at: Type.String({ format: "date-time" }),
  typed: Type.String(),
  final: Type.String(),
});

export const GameUpdate = Type.Partial(
  Type.Pick(Game, ["began_at", "ended_at"]),
);

export const ClueUpdate = Type.Partial(
  Type.Pick(Clue, ["began_at", "ended_at"]),
);
export const ClueCreate = Type.Intersect([
  Type.Pick(Clue, ["word_id"]),
  ClueUpdate,
]);

export const ShotCreate = Type.Omit(Shot, ["id", "game_id"]);
