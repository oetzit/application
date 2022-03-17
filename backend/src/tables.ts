// import { Knex } from "knex";
// import { FromSchema } from "json-schema-to-ts";

// // NOTE: this is tricky; refer to http://knexjs.org/#typescript-support

// const GameSchema = {
//   type: "object",
//   properties: {
//     id: {
//       type: "string",
//       format: "uuid",
//     },
//     foo: {
//       type: "number",
//     },
//   },
//   required: ["id"],
// } as const;

// type GameType = FromSchema<typeof GameSchema>;

// interface Game {
//   id: string;
// }

// declare module "knex/types/tables" {
//   interface Tables {
//     games: Game;
//     // games: Knex.CompositeTableType<
//     //   GameType,
//     //   Partial<Omit<GameType, "id">>,
//     //   Partial<Omit<GameType, "id">>,
//     //   Partial<Omit<GameType, "id">>
//     // >;
//   }
// }
