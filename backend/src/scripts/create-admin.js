import bcrypt from "bcryptjs";
import { pool, query } from "../db/pool.js";

const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";

try {
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Set ADMIN_EMAIL to a valid email address.");
  if (password.length < 10) throw new Error("Set ADMIN_PASSWORD to a password of at least 10 characters.");

  const hash = await bcrypt.hash(password, 12);
  await query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [email, hash]
  );
  console.log(`Admin account ready for ${email}. Remove ADMIN_PASSWORD from your .env now.`);
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
