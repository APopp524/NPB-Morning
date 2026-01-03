-- 003_add_standings_fields.sql
-- Add additional fields to standings table for SerpApi data
-- These fields provide more detailed standings information

ALTER TABLE standings
ADD COLUMN IF NOT EXISTS pct NUMERIC(4, 3),
ADD COLUMN IF NOT EXISTS home_record TEXT,
ADD COLUMN IF NOT EXISTS away_record TEXT,
ADD COLUMN IF NOT EXISTS last_10 TEXT,
ADD COLUMN IF NOT EXISTS league TEXT CHECK (league IN ('central', 'pacific'));

-- Add index on league for filtering
CREATE INDEX IF NOT EXISTS idx_standings_league ON standings(league);

