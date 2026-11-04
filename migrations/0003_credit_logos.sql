-- Logos for the credits list, stored as base64 (resized to 400px in the admin before upload).
ALTER TABLE credits ADD COLUMN logo TEXT;
ALTER TABLE credits ADD COLUMN logo_type TEXT;
ALTER TABLE credits ADD COLUMN updated_at INTEGER;
