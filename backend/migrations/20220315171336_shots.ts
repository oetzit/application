import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("shots", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("game_id").references("games.id").notNullable();
    table.uuid("clue_id").references("clues.id");
    table.timestamp("began_at");
    table.timestamp("ended_at");
    table.string("typed");
    table.string("final");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("shots");
}
