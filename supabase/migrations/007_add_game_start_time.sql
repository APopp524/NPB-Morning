-- Add start_time column to games table
-- Stores the game start time as TEXT (e.g., "5:00 AM" in EST)
-- SerpAPI is configured with location="New York, United States" to return EST times

ALTER TABLE games ADD COLUMN IF NOT EXISTS start_time TEXT;

-- Add comment for documentation
COMMENT ON COLUMN games.start_time IS 'Game start time in EST (e.g., "5:00 AM")';
