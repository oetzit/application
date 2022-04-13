import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("shots", (table) => {
      table.integer("score");
      table.float("similarity").nullable();
    })
    .alterTable("games", (table) => table.integer("score").nullable());
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("shots", (table) => {
      table.dropColumn("score");
      table.dropColumn("similarity");
    })
    .alterTable("games", (table) => table.dropColumn("score"));
}
