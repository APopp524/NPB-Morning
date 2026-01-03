/**
 * One-shot Standings Runner (Pre-Cron)
 * 
 * Purpose:
 * This script manually fetches and persists NPB standings for a given season.
 * It is intended for manual execution only, as a validation step before adding cron automation.
 * 
 * How to run:
 *   Unix/Linux/Mac:
 *     SERPAPI_KEY=your_key pnpm tsx src/scripts/run-standings.ts
 *     or: SERPAPI_KEY=your_key npm run run:standings
 * 
 *   Windows PowerShell:
 *     $env:SERPAPI_KEY="your_key"; npm run run:standings
 *     or: $env:SERPAPI_KEY="your_key"; npx tsx src/scripts/run-standings.ts
 * 
 *   Windows CMD:
 *     set SERPAPI_KEY=your_key && npm run run:standings
 *     or: set SERPAPI_KEY=your_key && npx tsx src/scripts/run-standings.ts
 * 
 * Environment Variables:
 *   - SERPAPI_KEY: Required. Your SerpApi API key.
 *   - SUPABASE_URL: Required. Your Supabase project URL (can be set in .env file).
 *   - SUPABASE_ANON_KEY: Required. Your Supabase anonymous key (can be set in .env file).
 * 
 * Note: This is a manual pre-cron validation script. Cron automation will be added later once validated.
 */

// Load environment variables from .env file if it exists
import 'dotenv/config';

import { SerpApiProvider } from '../backend/providers/serpapi';
import { upsertStandings } from '../backend/db/standings';

const SEASON = 2026; // Hardcoded season for now

async function run() {
  console.log('=== NPB Standings Runner ===');
  console.log(`Starting standings fetch for season ${SEASON}...`);

  // Validate API key
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    throw new Error(
      'SERPAPI_KEY environment variable is required. ' +
      'Set it before running this script or in your .env file. ' +
      'PowerShell: $env:SERPAPI_KEY="your_key"; npm run run:standings ' +
      'Unix/Mac: SERPAPI_KEY=your_key npm run run:standings'
    );
  }

  // Validate Supabase credentials
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required. ' +
      'Set them in your .env file or as environment variables before running this script.'
    );
  }

  // Instantiate provider in live mode
  console.log('Initializing SerpApiProvider in live mode...');
  const provider = new SerpApiProvider(apiKey, 'live');

  // Fetch standings for both leagues
  console.log(`Fetching standings for season ${SEASON} from SerpApi...`);
  let standings;
  try {
    standings = await provider.fetchStandingsForBothLeagues(SEASON);
  } catch (error) {
    throw new Error(
      `Failed to fetch standings: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // Log fetched standings (validation already done in fetchStandingsForBothLeagues)
  const centralCount = standings.filter(s => s.league === 'central').length;
  const pacificCount = standings.filter(s => s.league === 'pacific').length;
  console.log(`✓ Successfully fetched ${standings.length} standings rows`);
  console.log(`[standings] Central League: ${centralCount} teams`);
  console.log(`[standings] Pacific League: ${pacificCount} teams`);

  // Persist to database
  console.log('Persisting standings to database...');
  let dbRows;
  try {
    dbRows = await upsertStandings(standings);
  } catch (error) {
    throw new Error(
      `Failed to persist standings: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // Log persisted standings
  const persistedCentral = dbRows.filter(r => r.league === 'central').length;
  const persistedPacific = dbRows.filter(r => r.league === 'pacific').length;
  console.log(`✓ Successfully persisted ${dbRows.length} standings rows to database`);
  console.log(`[standings] Central League: ${persistedCentral} teams`);
  console.log(`[standings] Pacific League: ${persistedPacific} teams`);
  console.log(`[standings] Total rows persisted: ${dbRows.length}`);
  console.log('=== Standings Runner Complete ===');
}

// Execute the script
run().catch((error) => {
  console.error('✗ Error:', error.message);
  process.exit(1);
});

