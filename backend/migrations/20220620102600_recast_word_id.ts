import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("words", (table) => {
      table.string("word_id").alter();
    })
    .then(() => {
      return knex("words").update({
        word_id: knex.raw("LPAD(word_id, 4, '0')"),
      });
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("words", (table) => {
    table.integer("word_id").alter();
  });
}
