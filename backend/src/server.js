import app from "./app.js";
import { config, getJwtSecret } from "./config.js";
import { runMigrations } from "./db/migrate.js";

getJwtSecret(); // fail fast if the secret is missing or too short

if (config.autoMigrate) {
  try {
    await runMigrations();
    console.log("Database tables are ready.");
  } catch (err) {
    console.error("Could not prepare the database:", err.message);
    process.exit(1);
  }
}

app.listen(config.port, () => console.log(`Comrade Price Salon API listening on port ${config.port}`));
