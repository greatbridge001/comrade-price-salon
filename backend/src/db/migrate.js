import { readFile } from "node:fs/promises";
import { query } from "./pool.js";

export async function runMigrations() {
  const sql = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  await query(sql);
}
