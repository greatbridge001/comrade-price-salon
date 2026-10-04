import { HttpError } from "../utils/httpError.js";

// Express 5 forwards async errors here automatically.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, fields: err.fields });
  if (err?.type === "entity.parse.failed") return res.status(400).json({ error: "The request body is not valid JSON." });
  if (err?.type === "entity.too.large") return res.status(413).json({ error: "The request is too large." });
  if (err?.code === "23505") return res.status(409).json({ error: "An item with that name already exists." });
  console.error(err);
  return res.status(500).json({ error: "Something went wrong on our side. Please try again." });
}
