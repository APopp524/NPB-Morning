-- 008_remove_team_thumbnails.sql
-- Remove thumbnail columns from teams table.
-- Team logos are now served as static assets from the frontend (public/logos/).

ALTER TABLE teams
DROP COLUMN IF EXISTS thumbnail_url,
DROP COLUMN IF EXISTS thumbnail_source,
DROP COLUMN IF EXISTS thumbnail_updated_at;
