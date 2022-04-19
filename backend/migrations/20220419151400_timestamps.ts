import { Knex } from "knex";

const CREATE_ON_UPDATE_TIMESTAMP_FUNCTION = `
  CREATE OR REPLACE FUNCTION on_update_timestamp()
  RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
  $$ language 'plpgsql';
`;

const DROP_ON_UPDATE_TIMESTAMP_FUNCTION = `DROP FUNCTION on_update_timestamp`;

const createUpdatedAtTrigger = (table: string) => `
CREATE TRIGGER ${table}_updated_at
BEFORE UPDATE ON ${table}
FOR EACH ROW
EXECUTE PROCEDURE on_update_timestamp();
`;

const dropUpdatedAtTrigger = (table: string) =>
  `DROP TRIGGER ${table}_updated_at`;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw(CREATE_ON_UPDATE_TIMESTAMP_FUNCTION)
    .alterTable("words", (table) => table.timestamps(true, true))
    .alterTable("games", (table) => table.timestamps(true, true))
    .alterTable("clues", (table) => table.timestamps(true, true))
    .alterTable("shots", (table) => table.timestamps(true, true))
    .alterTable("devices", (table) => table.timestamps(true, true))
    .raw(createUpdatedAtTrigger("words"))
    .raw(createUpdatedAtTrigger("games"))
    .raw(createUpdatedAtTrigger("clues"))
    .raw(createUpdatedAtTrigger("shots"))
    .raw(createUpdatedAtTrigger("devices"));
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .raw(dropUpdatedAtTrigger("words"))
    .raw(dropUpdatedAtTrigger("games"))
    .raw(dropUpdatedAtTrigger("clues"))
    .raw(dropUpdatedAtTrigger("shots"))
    .raw(dropUpdatedAtTrigger("devices"))
    .alterTable("words", (table) => table.dropTimestamps())
    .alterTable("games", (table) => table.dropTimestamps())
    .alterTable("clues", (table) => table.dropTimestamps())
    .alterTable("shots", (table) => table.dropTimestamps())
    .alterTable("devices", (table) => table.dropTimestamps())
    .raw(DROP_ON_UPDATE_TIMESTAMP_FUNCTION);
}
