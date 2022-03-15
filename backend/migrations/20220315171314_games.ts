import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("games", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.timestamp("began_at");
    table.timestamp("ended_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("games");
}
