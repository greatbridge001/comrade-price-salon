import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config.js";
import { HttpError } from "../utils/httpError.js";

export function requireAuth(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) throw new HttpError(401, "Please sign in to continue.");
  try {
    req.user = jwt.verify(token, getJwtSecret());
  } catch {
    throw new HttpError(401, "Your session has expired. Please sign in again.");
  }
  next();
}
