import "dotenv/config";
import pg from "pg";

// Return DATE columns as plain "YYYY-MM-DD" strings (avoids timezone shifts).
pg.types.setTypeParser(1082, (value) => value);

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and paste your Neon connection string.");
}

const isLocal = /@(localhost|127\.0\.0\.1)/.test(url);

export const pool = new pg.Pool({
  connectionString: url,
  // Neon requires TLS. The connection string's sslmode=require already enables it.
  ssl: isLocal || /sslmode=/.test(url) ? undefined : { rejectUnauthorized: true },
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000, // Neon can take a moment to wake from idle
});

pool.on("error", (err) => console.error("Unexpected database error:", err.message));

export const query = (text, params) => pool.query(text, params);
