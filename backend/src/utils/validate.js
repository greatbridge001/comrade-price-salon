// Small field validators shared by the CRUD router and the appointment route.
// Returns { value } on success, { skip: true } to leave the field out, or { error } on failure.

export function coerce(field, raw) {
  const empty = raw === "" || raw === null || raw === undefined;
  const required = Boolean(field.required);

  switch (field.type) {
    case "string": {
      const s = String(raw ?? "").trim();
      if (!s && required) return { error: "This field is required." };
      if (s.length > (field.max || 200)) return { error: `Keep this under ${field.max || 200} characters.` };
      return { value: s };
    }
    case "int": {
      if (empty) return required ? { error: "This field is required." } : { skip: true };
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 0 || n > 10_000_000) return { error: "Enter a whole number of 0 or more." };
      return { value: n };
    }
    case "bool":
      return typeof raw === "boolean" ? { value: raw } : { error: "Must be true or false." };
    case "enum":
      return field.values.includes(raw) ? { value: raw } : { error: `Choose one of: ${field.values.join(", ")}.` };
    case "array": {
      const list = (Array.isArray(raw) ? raw : String(raw ?? "").split(","))
        .map((x) => String(x).trim())
        .filter(Boolean);
      if (list.length > 20 || list.some((x) => x.length > 40)) return { error: "Use up to 20 short items." };
      if (!list.length && required) return { error: "Add at least one item." };
      return { value: list };
    }
    case "url": {
      const s = String(raw ?? "").trim();
      if (s.length > 500) return { error: "That link is too long." };
      if (s && !/^https?:\/\//i.test(s) && !s.startsWith("/")) return { error: "Use a full https:// link or a path starting with /." };
      return { value: s };
    }
    default:
      return { error: "Unsupported field." };
  }
}

export const PHONE_RE = /^(?:\+?254|0)[17]\d{8}$/;
