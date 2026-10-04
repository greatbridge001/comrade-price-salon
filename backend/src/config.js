import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 4000,
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  autoMigrate: process.env.AUTO_MIGRATE !== "false",
  isProduction: process.env.NODE_ENV === "production",
};

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters.");
  }
  return secret;
}

// Allows exact matches and simple wildcards such as https://*.vercel.app
export function isOriginAllowed(origin) {
  return config.corsOrigins.some((pattern) => {
    if (!pattern.includes("*")) return pattern === origin;
    const regex = new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^.]+")}$`);
    return regex.test(origin);
  });
}
