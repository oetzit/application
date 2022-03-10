import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("words", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("page_id").index().notNullable();
    table.integer("word_id").index().notNullable();
    table.unique(["page_id", "word_id"]);
    table.binary("image").notNullable();
    table.string("ocr_transcript");
    table.float("ocr_confidence");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("words");
}
