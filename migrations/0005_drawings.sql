-- Drawings visitors make in the paint window. The worker also creates this table on first use,
-- so the site works even before this migration is applied.
CREATE TABLE IF NOT EXISTS drawings (
  id TEXT PRIMARY KEY,
  name TEXT,
  image TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  visitor TEXT
);
