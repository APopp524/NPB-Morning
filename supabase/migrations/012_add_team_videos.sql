-- 012_add_team_videos.sql
-- Add team_videos table for storing YouTube highlight videos fetched via SerpApi.
-- Follows the same pattern as news_articles: backend cron fetches, frontend reads.

CREATE TABLE IF NOT EXISTS team_videos (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id),
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  thumbnail TEXT,
  published_at TEXT,
  channel_name TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_team_videos_team_id ON team_videos (team_id);
CREATE INDEX IF NOT EXISTS idx_team_videos_fetched_at ON team_videos (fetched_at DESC);

COMMENT ON TABLE team_videos IS 'YouTube highlight videos per team, fetched from SerpApi YouTube search';
COMMENT ON COLUMN team_videos.id IS 'Deterministic hash of team_id + video_id for idempotent upserts';
COMMENT ON COLUMN team_videos.video_id IS 'YouTube video ID (the v= param)';
COMMENT ON COLUMN team_videos.published_at IS 'Relative date string from YouTube (e.g. "2 days ago")';
