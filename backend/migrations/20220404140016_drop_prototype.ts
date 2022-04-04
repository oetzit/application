import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.dropTable("game_results").dropTable("images");
}

export async function down(knex: Knex): Promise<void> {
  // NOTE: we're not interested in reversing this.
}
