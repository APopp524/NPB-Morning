/**
 * Standings Cron Runner (Node.js)
 * 
 * Purpose:
 * Idempotent cron job that fetches and persists NPB standings for a given season.
 * Designed for safe, production-ready execution with hard guards and structured logging.
 * 
 * This is the canonical entrypoint for standings ingestion. It uses shared backend modules
 * for all business logic, ensuring a single source of truth.
 * 
 * How to run:
 *   # Manual run (default season = current year)
 *   npm run standings:run
 * 
 *   # Manual run with specific season
 *   npm run standings:run -- --season=2026
 * 
 *   # Direct execution
 *   tsx src/scripts/run-standings.ts [--season=2026]
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
 *   - Uses idempotent upserts keyed by (team_id, season)
 *   - No duplicate rows, no race conditions
 */

// Load environment variables from .env file if it exists
import 'dotenv/config';

import { SerpApiClient } from '../backend/providers/serpapi/client';
import { fetchStandingsForBothLeagues } from '../backend/standings/standings.fetcher';
import { validateStandingsData } from '../backend/standings/standings.validation';
import { getTeams } from '../backend/db/teams';
import { upsertStandings, keepaliveStandings } from '../backend/db/standings';
import type { StandingInput } from '../backend/models/standing';

/**
 * Parse CLI arguments for season
 */
function parseSeasonArg(): number {
  const args = process.argv.slice(2);
  const seasonArg = args.find(arg => arg.startsWith('--season='));
  
  if (seasonArg) {
    const season = parseInt(seasonArg.split('=')[1], 10);
    if (isNaN(season) || season < 2000 || season > 2100) {
      throw new Error(`Invalid season: ${seasonArg}. Must be a year between 2000 and 2100.`);
    }
    return season;
  }
  
  // Default to current year
  return new Date().getFullYear();
}

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
  const prefix = '[standings][cron]';
  const timestamp = new Date().toISOString();
  if (level === 'error') {
    console.error(`${prefix}[ERROR] ${timestamp} ${message}`);
  } else {
    console.log(`${prefix} ${timestamp} ${message}`);
  }
}

/**
 * Check if current date falls within preseason period.
 * Preseason: January 1 → March 20
 * Regular season: March 21 → December 31
 * 
 * @param season The season year
 * @returns true if current date is in preseason period
 */
function isPreseasonByDate(season: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // If we're in the same year as the season, check if before March 21
  if (currentYear === season) {
    if (month < 3) {
      return true; // January or February
    }
    if (month === 3 && day < 21) {
      return true; // March 1-20
    }
    return false; // March 21 onwards
  }

  // If we're in the year before the season, it's preseason
  if (currentYear === season - 1) {
    return true; // Preseason for next year
  }

  // Otherwise, assume regular season
  return false;
}

/**
 * Main standings runner logic
 */
async function runStandingsForSeason(season: number): Promise<void> {
  log('info', 'Starting standings run');
  log('info', `Season: ${season}`);

  // Validate environment
  validateEnvironment();

  // Get API key
  const apiKey = process.env.SERPAPI_KEY!;
  const serpApiClient = new SerpApiClient(apiKey);

  // Fetch teams from database
  log('info', 'Fetching teams from database...');
  const teams = await getTeams();
  if (teams.length === 0) {
    throw new Error('No teams found in database. Teams must be seeded before mapping standings.');
  }
  if (teams.length !== 12) {
    throw new Error(`Expected exactly 12 teams in database, got ${teams.length}`);
  }
  log('info', `Found ${teams.length} teams in database`);

  // Check date-based preseason detection as a fallback
  const isPreseasonByDateCheck = isPreseasonByDate(season);
  if (isPreseasonByDateCheck) {
    log('info', 'Preseason detected (date-based) — running keepalive update only');
    try {
      const updatedCount = await keepaliveStandings(season);
      log('info', `Keepalive update complete: ${updatedCount} standings row(s) updated`);
      log('info', 'Success');
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Preseason keepalive failed: ${errorMessage}`);
    }
  }

  // Fetch standings for both leagues using shared fetcher
  log('info', `Fetching standings for season ${season} from SerpApi...`);
  const result = await fetchStandingsForBothLeagues({
    serpApiClient,
    season,
    teams,
  });

  // Handle preseason state detected from API response
  if (result.status === 'preseason') {
    log('info', 'Preseason detected (API response) — running keepalive update only');
    try {
      const updatedCount = await keepaliveStandings(season);
      log('info', `Keepalive update complete: ${updatedCount} standings row(s) updated`);
      log('info', 'Success');
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Preseason keepalive failed: ${errorMessage}`);
    }
  }

  const standings = result.standings;
  const centralCount = standings.filter(s => s.league === 'central').length;
  const pacificCount = standings.filter(s => s.league === 'pacific').length;
  log('info', `Central League: ${centralCount} teams`);
  log('info', `Pacific League: ${pacificCount} teams`);

  // Hard validation guards
  log('info', 'Validating standings data...');
  validateStandingsData(standings);

  // Persist to database (idempotent upsert)
  log('info', 'Persisting standings to database...');
  const dbRows = await upsertStandings(standings);

  if (dbRows.length !== 12) {
    throw new Error(`Expected exactly 12 persisted rows, got ${dbRows.length}`);
  }

  log('info', `Upsert complete (${dbRows.length} rows)`);
  log('info', 'Success');
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    const season = parseSeasonArg();
    await runStandingsForSeason(season);
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('error', errorMessage);
    process.exit(1);
  }
}

// Execute the script
main();

