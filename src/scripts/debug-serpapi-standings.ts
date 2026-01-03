// DEBUG ONLY — DO NOT COMMIT OUTPUT
// This script fetches raw SerpApi response for NPB standings inspection.
// It does not affect production code paths, providers, or database.

import { SerpApiProvider } from '../backend/providers/serpapi';
import { upsertStandings } from '../backend/db/standings';

const season = 2024; // Hardcoded season for debugging

async function main() {
  // Read API key from environment
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    throw new Error(
      'SERPAPI_KEY environment variable is required. ' +
        'Set it before running this script: SERPAPI_KEY=your_key tsx src/scripts/debug-serpapi-standings.ts'
    );
  }

  // Build SerpApi request URL
  const baseUrl = 'https://serpapi.com/search.json';
  const url = new URL(baseUrl);
  url.searchParams.set('engine', 'google');
  url.searchParams.set('q', `NPB standings ${season}`);
  url.searchParams.set('api_key', apiKey);

  console.error(`Fetching SerpApi response for: NPB standings ${season}`);
  console.error(`URL: ${url.toString().replace(apiKey, '***REDACTED***')}`);

  // Fetch from SerpApi
  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch (error) {
    throw new Error(
      `Failed to fetch from SerpApi: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }

  // Validate HTTP response
  if (!response.ok) {
    throw new Error(
      `SerpApi returned error status ${response.status}: ${response.statusText}`
    );
  }

  // Parse JSON response
  let json: any;
  try {
    json = await response.json();
  } catch (error) {
    throw new Error(
      `Failed to parse SerpApi response as JSON: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }

  // Output raw JSON, pretty-printed with 2-space indentation
  console.error('\n=== RAW SERPAPI RESPONSE ===');
  console.log(JSON.stringify(json, null, 2));

  // Extract and normalize standings
  console.error('\n=== NORMALIZED STANDINGS ===');
  const provider = new SerpApiProvider(apiKey, 'live');
  // Fetch both leagues for debugging
  const normalizedStandings = await provider.fetchStandingsForBothLeagues(season);
  console.log(JSON.stringify(normalizedStandings, null, 2));

  // Persist to database
  console.error('\n=== PERSISTING TO DATABASE ===');
  try {
    const dbRows = await upsertStandings(normalizedStandings);
    console.error(`✓ Successfully upserted ${dbRows.length} standings`);
    console.log(JSON.stringify(dbRows, null, 2));
  } catch (error) {
    console.error(`✗ Failed to persist standings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Run the script
main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});

// Usage:
// 
// PowerShell:
//   $env:SERPAPI_KEY="your_key"; npx tsx src/scripts/debug-serpapi-standings.ts > standings.json
//
// CMD:
//   set SERPAPI_KEY=your_key && npx tsx src/scripts/debug-serpapi-standings.ts > standings.json
//
// Unix/Linux/Mac:
//   SERPAPI_KEY=your_key npx tsx src/scripts/debug-serpapi-standings.ts > standings.json
//
// Or use npm script:
//   $env:SERPAPI_KEY="your_key"; npm run debug:standings > standings.json

