-- 004_add_team_thumbnails.sql
-- Add thumbnail support to teams table
-- Thumbnails are optional enrichment data from SerpApi

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_source TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_updated_at TIMESTAMPTZ;

