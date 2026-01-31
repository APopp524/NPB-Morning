-- 006_add_news_articles.sql
-- Add news_articles table for storing NPB news from Google News API

CREATE TABLE IF NOT EXISTS news_articles (
  id TEXT PRIMARY KEY,                    -- SHA256 hash of link for idempotency
  title TEXT NOT NULL,
  link TEXT NOT NULL UNIQUE,
  source_name TEXT,
  source_icon TEXT,
  thumbnail TEXT,
  thumbnail_small TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching recent articles
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_fetched_at ON news_articles (fetched_at DESC);

-- Add comment for documentation
COMMENT ON TABLE news_articles IS 'NPB news articles fetched from Google News API via SerpApi';
COMMENT ON COLUMN news_articles.id IS 'SHA256 hash of link for idempotent upserts';
COMMENT ON COLUMN news_articles.thumbnail_small IS 'Low-resolution thumbnail from Google News API';
