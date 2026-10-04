import { pool } from "../db/pool.js";
import { runMigrations } from "../db/migrate.js";

try {
  await runMigrations();
  console.log("Database tables are ready.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
