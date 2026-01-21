-- 006_seed_standings_2026.sql
-- Seed empty standings rows for season 2026
-- This allows preseason cron keepalive updates to have rows to touch
-- Idempotent: uses ON CONFLICT DO NOTHING to avoid overwriting existing data

INSERT INTO standings (id, team_id, season, wins, losses, ties, games_back, pct, home_record, away_record, last_10, league, updated_at)
SELECT 
  CONCAT('2026-', teams.id) AS id,
  teams.id AS team_id,
  2026 AS season,
  0 AS wins,
  0 AS losses,
  0 AS ties,
  0 AS games_back,
  NULL AS pct,
  NULL AS home_record,
  NULL AS away_record,
  NULL AS last_10,
  teams.league AS league,
  NOW() AS updated_at
FROM teams
ON CONFLICT (team_id, season) DO NOTHING;
