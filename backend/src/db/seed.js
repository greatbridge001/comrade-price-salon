import { readFile } from "node:fs/promises";
import { query } from "./pool.js";

// Inserts the starter catalogue (from the owner's price list) into any table that is still empty.
// seed-data.json is generated from the frontend data files, so the site and database start identical.
export async function seedCatalog() {
  const data = JSON.parse(await readFile(new URL("./seed-data.json", import.meta.url), "utf8"));
  const summary = {};

  const tables = {
    services: ["category", "name", "price", "description", "sort_order"],
    products: ["name", "category", "price", "description", "sizes", "colours", "image_url", "in_stock", "sort_order"],
    gallery: ["style_name", "category", "starting_price", "service_name", "image_url", "sort_order"],
  };

  for (const [table, columns] of Object.entries(tables)) {
    const { rows } = await query(`SELECT COUNT(*)::int AS n FROM ${table}`);
    if (rows[0].n > 0) {
      summary[table] = "skipped (already has data)";
      continue;
    }
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    for (const row of data[table]) {
      await query(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`, columns.map((c) => row[c]));
    }
    summary[table] = `${data[table].length} rows added`;
  }
  return summary;
}
