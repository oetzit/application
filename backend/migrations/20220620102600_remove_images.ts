import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("words", (table) => table.dropColumn("image"));
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    "words",
    (table) => table.binary("image").notNullable(), // obv. non reversible but... meh
  );
}
