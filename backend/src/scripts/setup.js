// One command for a fresh Neon database: tables, starter catalogue, and the first admin account.
import bcrypt from "bcryptjs";
import { pool, query } from "../db/pool.js";
import { runMigrations } from "../db/migrate.js";
import { seedCatalog } from "../db/seed.js";

try {
  await runMigrations();
  console.log("Tables ready.");
  console.log("Catalogue:", await seedCatalog());

  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (email && password.length >= 10) {
    const hash = await bcrypt.hash(password, 12);
    await query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [email, hash]
    );
    console.log(`Admin account ready for ${email}. Remove ADMIN_PASSWORD from your .env now.`);
  } else {
    console.log("No admin created: set ADMIN_EMAIL and an ADMIN_PASSWORD of 10+ characters, then run: npm run db:create-admin");
  }
} catch (err) {
  console.error("Setup failed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
