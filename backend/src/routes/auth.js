import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { getJwtSecret } from "../config.js";
import { query } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../utils/httpError.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Please wait 15 minutes and try again." },
});

// Compared against when the email is unknown, so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

router.post("/login", loginLimiter, async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (!email || !password) throw new HttpError(400, "Enter your email and password.");

  const { rows } = await query("SELECT id, email, password_hash FROM users WHERE email = $1", [email]);
  const user = rows[0];
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, "Incorrect email or password.");

  const token = jwt.sign({ email: user.email }, getJwtSecret(), { subject: String(user.id), expiresIn: "12h" });
  res.json({ token, user: { id: user.id, email: user.email } });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ id: Number(req.user.sub), email: req.user.email });
});

export default router;
