CREATE TABLE IF NOT EXISTS works (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'Other',
  title_en TEXT NOT NULL,
  title_ar TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS credits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role_en TEXT,
  role_ar TEXT,
  url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  project_type TEXT,
  budget TEXT,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  created_at INTEGER NOT NULL
);
