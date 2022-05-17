import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("devices", (table) =>
    table.string("email").nullable(),
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("devices", (table) =>
    table.dropColumn("email"),
  );
}
