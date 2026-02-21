-- 009_add_team_details.sql
-- Add metadata columns to the teams table for team detail pages.

ALTER TABLE teams
  ADD COLUMN stadium TEXT,
  ADD COLUMN city TEXT,
  ADD COLUMN website_url TEXT,
  ADD COLUMN twitter_url TEXT,
  ADD COLUMN instagram_url TEXT,
  ADD COLUMN youtube_channel_url TEXT,
  ADD COLUMN photo_url TEXT;
