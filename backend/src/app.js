import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { isOriginAllowed } from "./config.js";
import { query } from "./db/pool.js";
import { errorHandler } from "./middleware/errorHandler.js";
import appointmentsRouter from "./routes/appointments.js";
import authRouter from "./routes/auth.js";
import { galleryRouter, productsRouter, servicesRouter } from "./routes/resources.js";

const app = express();

app.set("trust proxy", 1); // Railway sits behind a proxy; needed for correct client IPs in rate limiting
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || isOriginAllowed(origin)),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50kb" }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/api/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "database-unavailable" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/services", servicesRouter);
app.use("/api/products", productsRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/appointments", appointmentsRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found." }));
app.use(errorHandler);

export default app;
