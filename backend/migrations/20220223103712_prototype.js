/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("images", function (table) {
      table.increments("id").primary();
      table.string("filename", 200);
      table.string("md5", 255);
      table.binary("image");
    })
    .createTable("game_results", function (table) {
      table.increments("id").primary();
      table.string("transcription", 255);
      table.integer("gametime", 11).notNullable();
      table.integer("id_image", 11).notNullable();
      table.foreign("id_image").references("id").inTable("images");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("game_results").dropTable("images");
};
