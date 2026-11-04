-- Manual order for clips (smaller first). Existing clips keep newest-first among equal positions.
ALTER TABLE works ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
