/**
 * News Cron Runner (Node.js)
 * 
 * Purpose:
 * Idempotent cron job that fetches and persists NPB news articles from Google News API.
 * Designed for safe, production-ready execution with structured logging.
 * 
 * This script uses the Google News API (engine=google_news) via SerpApi to fetch
 * news articles related to NPB baseball.
 * 
 * How to run:
 *   # Manual run
 *   npm run news:run
 * 
 *   # Direct execution
 *   tsx src/scripts/run-news.ts
 * 
 * Environment Variables:
 *   - SERPAPI_KEY: Required. Your SerpApi API key.
 *   - SUPABASE_URL: Required. Your Supabase project URL.
 *   - SUPABASE_SERVICE_ROLE_KEY: Preferred for writes. Falls back to SUPABASE_ANON_KEY.
 *   - SUPABASE_ANON_KEY: Fallback if SUPABASE_SERVICE_ROLE_KEY is not set.
 * 
 * Exit Codes:
 *   - 0: Success
 *   - 1: Failure (validation error, API error, DB error, etc.)
 * 
 * Idempotency:
 *   - Safe to run multiple times
 *   - Uses idempotent upserts keyed by article link hash
 *   - No duplicate rows, no race conditions
 */

// Load environment variables from .env file if it exists
import 'dotenv/config';

import { parseNewsFromResponse, toNewsArticleInputs, type GoogleNewsApiResponse } from '../backend/providers/serpapi/news.parser';
import { upsertNewsArticles, deleteOldNewsArticles } from '../backend/db/news';

/**
 * Validate required environment variables
 */
function validateEnvironment(): void {
  if (!process.env.SERPAPI_KEY) {
    throw new Error('SERPAPI_KEY environment variable is required');
  }

  if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL environment variable is required');
  }

  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasAnonKey = !!process.env.SUPABASE_ANON_KEY;

  if (!hasServiceKey && !hasAnonKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable is required'
    );
  }
}

/**
 * Structured logging helper
 */
function log(level: 'info' | 'error', message: string): void {
  const prefix = '[news][cron]';
  const timestamp = new Date().toISOString();
  if (level === 'error') {
    console.error(`${prefix}[ERROR] ${timestamp} ${message}`);
  } else {
    console.log(`${prefix} ${timestamp} ${message}`);
  }
}

/**
 * Fetch news from Google News API via SerpApi.
 * Uses the google_news engine for news-specific results.
 */
async function fetchNewsFromSerpApi(apiKey: string, query: string): Promise<GoogleNewsApiResponse> {
  const baseUrl = 'https://serpapi.com/search.json';
  const url = new URL(baseUrl);
  
  // Use google_news engine for news results
  url.searchParams.set('engine', 'google_news');
  url.searchParams.set('q', query);
  url.searchParams.set('gl', 'us'); // Country: US for English results
  url.searchParams.set('hl', 'en'); // Language: English
  url.searchParams.set('api_key', apiKey);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(
      `SerpApi returned error status ${response.status}: ${response.statusText}`
    );
  }

  const json = (await response.json()) as GoogleNewsApiResponse;

  // Check for API errors
  if (json.error) {
    throw new Error(`SerpApi API error: ${json.error}`);
  }

  return json;
}

/**
 * Main news runner logic
 */
async function runNewsFetch(): Promise<void> {
  log('info', 'Starting news fetch');

  // Validate environment
  validateEnvironment();

  const apiKey = process.env.SERPAPI_KEY!;
  const query = 'npb baseball news';

  // Fetch news from Google News API
  log('info', `Fetching news with query: "${query}"`);
  const response = await fetchNewsFromSerpApi(apiKey, query);

  // Log search metadata for debugging
  if (response.search_metadata?.id) {
    log('info', `SerpApi search ID: ${response.search_metadata.id}`);
  }

  // Parse the response
  log('info', 'Parsing news results...');
  const parsedArticles = parseNewsFromResponse(response, 12);
  log('info', `Parsed ${parsedArticles.length} articles`);

  if (parsedArticles.length === 0) {
    log('info', 'No news articles found — skipping database operations');
    log('info', 'Success (no articles)');
    return;
  }

  // Convert to NewsArticleInput format
  const articleInputs = toNewsArticleInputs(parsedArticles);

  // Persist to database (idempotent upsert)
  log('info', 'Persisting news articles to database...');
  const dbRows = await upsertNewsArticles(articleInputs);
  log('info', `Upsert complete (${dbRows.length} rows)`);

  // Clean up old articles (keep last 30 days)
  log('info', 'Cleaning up old articles...');
  const deletedCount = await deleteOldNewsArticles(30);
  if (deletedCount > 0) {
    log('info', `Deleted ${deletedCount} old article(s)`);
  }

  log('info', 'Success');
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    await runNewsFetch();
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('error', errorMessage);
    process.exit(1);
  }
}

// Execute the script
main();
