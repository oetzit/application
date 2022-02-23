import knex from "knex";

export const connection = knex({
  client: "sqlite3", // or 'better-sqlite3'
  connection: {
    filename: "./mydb.sqlite",
    // filename: ":memory:",
  },
});
