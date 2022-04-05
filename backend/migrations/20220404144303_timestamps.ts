import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("words", (table) => table.timestamps())
    .alterTable("games", (table) => table.timestamps())
    .alterTable("clues", (table) => table.timestamps())
    .alterTable("shots", (table) => table.timestamps());
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("words", (table) => table.dropTimestamps())
    .alterTable("games", (table) => table.dropTimestamps())
    .alterTable("clues", (table) => table.dropTimestamps())
    .alterTable("shots", (table) => table.dropTimestamps());
}
