import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("games", (table) => table.integer("began_at_gmtm").unsigned())
    .alterTable("clues", (table) => table.integer("began_at_gmtm").unsigned())
    .alterTable("shots", (table) => table.integer("began_at_gmtm").unsigned())
    .alterTable("games", (table) => table.integer("ended_at_gmtm").unsigned())
    .alterTable("clues", (table) => table.integer("ended_at_gmtm").unsigned())
    .alterTable("shots", (table) => table.integer("ended_at_gmtm").unsigned());
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("games", (table) => table.dropColumn("began_at_gmtm"))
    .alterTable("clues", (table) => table.dropColumn("began_at_gmtm"))
    .alterTable("shots", (table) => table.dropColumn("began_at_gmtm"))
    .alterTable("games", (table) => table.dropColumn("ended_at_gmtm"))
    .alterTable("clues", (table) => table.dropColumn("ended_at_gmtm"))
    .alterTable("shots", (table) => table.dropColumn("ended_at_gmtm"));
}
