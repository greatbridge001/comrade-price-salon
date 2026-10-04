import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../utils/httpError.js";
import { coerce } from "../utils/validate.js";

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, "Not found.");
  return id;
}

// Builds list / create / update / delete routes for a table from a field list.
// GET is public (the website reads it). POST, PUT and DELETE need an admin token.
// Table, column and ORDER BY strings come from code below, never from user input.
export function createCrudRouter({ table, fields, orderBy }) {
  const router = Router();

  function parseBody(body, { partial }) {
    const values = {};
    const errors = {};
    for (const field of fields) {
      const provided = body && body[field.name] !== undefined;
      if (!provided) {
        if (!partial && field.required) errors[field.name] = "This field is required.";
        continue;
      }
      const result = coerce(field, body[field.name]);
      if (result.error) errors[field.name] = result.error;
      else if (!result.skip) values[field.name] = result.value;
    }
    if (Object.keys(errors).length) throw new HttpError(400, "Please fix the highlighted fields.", errors);
    if (Object.keys(values).length === 0) throw new HttpError(400, "Nothing to save.");
    return values;
  }

  router.get("/", async (_req, res) => {
    const { rows } = await query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
    res.json(rows);
  });

  router.post("/", requireAuth, async (req, res) => {
    const values = parseBody(req.body, { partial: false });
    // New items go to the end of the list unless a sort order is given.
    if (values.sort_order === undefined) {
      const { rows } = await query(`SELECT COALESCE(MAX(sort_order), 0) + 10 AS next FROM ${table}`);
      values.sort_order = rows[0].next;
    }
    const cols = Object.keys(values);
    const { rows } = await query(
      `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING *`,
      cols.map((c) => values[c])
    );
    res.status(201).json(rows[0]);
  });

  router.put("/:id", requireAuth, async (req, res) => {
    const id = parseId(req.params.id);
    const values = parseBody(req.body, { partial: true });
    const cols = Object.keys(values);
    const { rows } = await query(
      `UPDATE ${table} SET ${cols.map((c, i) => `${c} = $${i + 1}`).join(", ")}, updated_at = now() WHERE id = $${cols.length + 1} RETURNING *`,
      [...cols.map((c) => values[c]), id]
    );
    if (!rows[0]) throw new HttpError(404, "Not found.");
    res.json(rows[0]);
  });

  router.delete("/:id", requireAuth, async (req, res) => {
    const { rowCount } = await query(`DELETE FROM ${table} WHERE id = $1`, [parseId(req.params.id)]);
    if (!rowCount) throw new HttpError(404, "Not found.");
    res.status(204).end();
  });

  return router;
}
