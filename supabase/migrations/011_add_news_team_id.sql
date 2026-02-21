-- 011_add_news_team_id.sql
-- Add team_id to news_articles for team-specific news tagging.
-- Nullable because general NPB news articles have no specific team.

ALTER TABLE news_articles
  ADD COLUMN team_id TEXT REFERENCES teams(id);

CREATE INDEX idx_news_team_id ON news_articles(team_id);
