import { Router } from "express";
import rateLimit from "express-rate-limit";
import { query } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../utils/httpError.js";
import { PHONE_RE } from "../utils/validate.js";

const router = Router();
const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many booking requests from this connection. Please try again later or message us on WhatsApp." },
});

const todayInNairobi = () => new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });

function validateBooking(body = {}) {
  const errors = {};
  const fullName = String(body.full_name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const serviceName = String(body.service_name ?? "").trim();
  const date = String(body.preferred_date ?? "").trim();
  const time = String(body.preferred_time ?? "").trim();
  const notes = String(body.notes ?? "").trim();

  if (fullName.length < 2 || fullName.length > 80) errors.full_name = "Enter your full name.";
  if (!PHONE_RE.test(phone.replace(/[\s\-()]/g, ""))) errors.phone = "Enter a valid Kenyan phone number.";
  if (!serviceName || serviceName.length > 120) errors.service_name = "Choose a service.";

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date));
  if (!validDate) errors.preferred_date = "Choose a valid date.";
  else if (date < todayInNairobi()) errors.preferred_date = "Choose today or a later date.";

  if (!/^\d{1,2}:\d{2} (AM|PM)$/.test(time)) errors.preferred_time = "Choose a time.";
  if (notes.length > 500) errors.notes = "Keep notes under 500 characters.";

  if (Object.keys(errors).length) throw new HttpError(400, "Please check the booking details.", errors);
  return { fullName, phone, serviceName, date, time, notes };
}

// Public: the website submits booking requests here.
router.post("/", bookingLimiter, async (req, res) => {
  const b = validateBooking(req.body);
  const match = await query("SELECT id FROM services WHERE lower(name) = lower($1) LIMIT 1", [b.serviceName]);
  const { rows } = await query(
    `INSERT INTO appointments (full_name, phone, service_id, service_name, preferred_date, preferred_time, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, status`,
    [b.fullName, b.phone, match.rows[0]?.id ?? null, b.serviceName, b.date, b.time, b.notes]
  );
  res.status(201).json(rows[0]);
});

// Admin only below.
router.get("/", requireAuth, async (_req, res) => {
  const { rows } = await query("SELECT * FROM appointments ORDER BY created_at DESC LIMIT 500");
  res.json(rows);
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const status = req.body?.status;
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, "Not found.");
  if (!STATUSES.includes(status)) throw new HttpError(400, `Status must be one of: ${STATUSES.join(", ")}.`);
  const { rows } = await query("UPDATE appointments SET status = $1, updated_at = now() WHERE id = $2 RETURNING *", [status, id]);
  if (!rows[0]) throw new HttpError(404, "Not found.");
  res.json(rows[0]);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, "Not found.");
  const { rowCount } = await query("DELETE FROM appointments WHERE id = $1", [id]);
  if (!rowCount) throw new HttpError(404, "Not found.");
  res.status(204).end();
});

export default router;
