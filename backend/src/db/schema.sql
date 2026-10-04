-- Comrade Price Salon schema. Idempotent: safe to run on every start.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id          SERIAL PRIMARY KEY,
  category    TEXT NOT NULL CHECK (category IN ('locks', 'twists', 'other')),
  name        TEXT NOT NULL,
  price       INTEGER NOT NULL CHECK (price >= 0),
  description TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS services_name_unique ON services (lower(name));

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('dresses','tops','trousers','skirts','jeans','sets','hoodies','sweaters','accessories')),
  price       INTEGER NOT NULL CHECK (price >= 0),
  description TEXT NOT NULL DEFAULT '',
  sizes       TEXT[] NOT NULL DEFAULT '{}',
  colours     TEXT[] NOT NULL DEFAULT '{}',
  image_url   TEXT NOT NULL DEFAULT '',
  in_stock    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery (
  id             SERIAL PRIMARY KEY,
  style_name     TEXT NOT NULL,
  category       TEXT NOT NULL CHECK (category IN ('braids','twists','locs','natural','other')),
  starting_price INTEGER NOT NULL CHECK (starting_price >= 0),
  service_name   TEXT NOT NULL DEFAULT '',
  image_url      TEXT NOT NULL DEFAULT '',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id             SERIAL PRIMARY KEY,
  full_name      TEXT NOT NULL,
  phone          TEXT NOT NULL,
  service_id     INTEGER REFERENCES services (id) ON DELETE SET NULL,
  service_name   TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  notes          TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS appointments_status_created ON appointments (status, created_at DESC);
