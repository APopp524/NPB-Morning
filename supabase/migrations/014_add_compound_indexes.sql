-- 014_add_compound_indexes.sql
-- Add compound indexes that match the most common frontend query patterns,
-- allowing Postgres to satisfy WHERE + ORDER BY from a single index scan.

-- getGames(): WHERE date >= ? ORDER BY date ASC
-- The existing idx_games_date covers this, but adding status lets the planner
-- use an index-only scan for the upcoming-games filter (.in('status',...)).
CREATE INDEX IF NOT EXISTS idx_games_date_status
  ON games (date, status);

-- getStandings(): ORDER BY season DESC, wins DESC, losses ASC  LIMIT 12
CREATE INDEX IF NOT EXISTS idx_standings_season_wins_losses
  ON standings (season DESC, wins DESC, losses ASC);

-- getTeamNews(): WHERE team_id = ? AND (published_at >= ? OR ...) ORDER BY published_at DESC
CREATE INDEX IF NOT EXISTS idx_news_team_published
  ON news_articles (team_id, published_at DESC);

-- getTeamVideos(): WHERE team_id = ? ORDER BY published_at DESC
CREATE INDEX IF NOT EXISTS idx_team_videos_team_published
  ON team_videos (team_id, published_at DESC);
