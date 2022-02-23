const fs = require("fs").promises;

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("images").del();
  const files = await fs.readdir("seeds/images");
  for (const file of files) {
    const path = `seeds/images/${file}`;
    const data = await fs.readFile(path);
    await knex("images").insert([
      {
        filename: file,
        md5: "", // TODO
        image: data.toString("base64"),
      },
    ]);
  }
};
