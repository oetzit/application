import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("devices", function (table) {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.timestamps();
    })
    .alterTable("games", (table) => {
      table.uuid("device_id").references("devices.id"); // TODO: .notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("games", (table) => {
      table.dropColumn("device_id");
    })
    .dropTable("devices");
}
