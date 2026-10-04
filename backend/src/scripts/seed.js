import { pool } from "../db/pool.js";
import { seedCatalog } from "../db/seed.js";

try {
  console.log("Seed result:", await seedCatalog());
} catch (err) {
  console.error("Seeding failed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
