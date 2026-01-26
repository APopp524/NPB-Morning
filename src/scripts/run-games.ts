/**
 * Games Cron Runner (Node.js)
 * 
 * Purpose:
 * Idempotent cron job that fetches and persists NPB games for today.
 * Designed for safe, production-ready execution with hard guards and structured logging.
 * 
 * This is the canonical entrypoint for games ingestion. It uses shared backend modules
 * for all business logic, ensuring a single source of truth.
 * 
 * How to run:
 *   # Manual run (default date = today)
 *   npm run games:run
 * 
 *   # Manual run with specific date
 *   npm run games:run -- --date=2026-01-25
 * 
 *   # Direct execution
 *   tsx src/scripts/run-games.ts [--date=2026-01-25]
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
 *   - Uses idempotent upserts keyed by (date, home_team_id, away_team_id)
 *   - No duplicate rows, no race conditions
 */

// Load environment variables from .env file if it exists
import 'dotenv/config';

import { SerpApiProvider } from '../backend/providers/serpapi';
import { getTeams } from '../backend/db/teams';
import { upsertGames } from '../backend/db/games';
import { GameInput } from '../backend/models/game';
import { mapSerpApiTeamNameToDatabaseTeam } from '../backend/providers/serpapi/team-map';

/**
 * Parse CLI arguments for date
 */
function parseDateArg(): string {
  const args = process.argv.slice(2);
  const dateArg = args.find(arg => arg.startsWith('--date='));
  
  if (dateArg) {
    const dateStr = dateArg.split('=')[1];
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      throw new Error(`Invalid date format: ${dateStr}. Must be YYYY-MM-DD.`);
    }
    // Validate date is valid
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`);
    }
    return dateStr;
  }
  
  // Default to today in YYYY-MM-DD format
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const prefix = '[games][cron]';
  const timestamp = new Date().toISOString();
  if (level === 'error') {
    console.error(`${prefix}[ERROR] ${timestamp} ${message}`);
  } else {
    console.log(`${prefix} ${timestamp} ${message}`);
  }
}

/**
 * Main games runner logic
 */
async function runGamesForDate(dateStr: string): Promise<void> {
  log('info', 'Starting games run');
  log('info', `Date: ${dateStr}`);

  // Validate environment
  validateEnvironment();

  // Get API key
  const apiKey = process.env.SERPAPI_KEY!;
  const provider = new SerpApiProvider(apiKey);

  // Fetch teams from database
  log('info', 'Fetching teams from database...');
  const teams = await getTeams();
  if (teams.length === 0) {
    throw new Error('No teams found in database. Teams must be seeded before mapping games.');
  }
  if (teams.length !== 12) {
    throw new Error(`Expected exactly 12 teams in database, got ${teams.length}`);
  }
  log('info', `Found ${teams.length} teams in database`);

  // Fetch games from SerpApi
  log('info', 'Fetching games from SerpApi...');
  const gamesResult = await provider.fetchGamesReadOnly();
  
  log('info', `Games fetch status: ${gamesResult.status}`);
  log('info', `Source query: ${gamesResult.sourceQuery || 'N/A'}`);
  log('info', `Games found: ${gamesResult.games.length}`);

  // Convert games from ParsedGame format to GameInput format
  const gameInputs: GameInput[] = [];
  
  if (gamesResult.status !== 'NO_GAMES' && gamesResult.games.length > 0) {
    // Determine status based on fetch result
    const gameStatus: GameInput['status'] = 
      gamesResult.status === 'LIVE' ? 'in_progress' : 'scheduled';

    log('info', `Converting ${gamesResult.games.length} games to GameInput format...`);
    
    for (const parsedGame of gamesResult.games) {
      // Map team names to team IDs
      const homeTeamId = mapSerpApiTeamNameToDatabaseTeam(parsedGame.home_team_name, teams);
      const awayTeamId = mapSerpApiTeamNameToDatabaseTeam(parsedGame.away_team_name, teams);

      // Skip if team mapping fails
      if (!homeTeamId || !awayTeamId) {
        log('error', `Skipping game: could not map teams "${parsedGame.home_team_name}" or "${parsedGame.away_team_name}"`);
        continue;
      }

      // Parse date - use game_date if available, otherwise use dateStr (today)
      // When SerpApi returns dates without year (e.g., "Mar 27"), assume current year
      let gameDate = dateStr;
      if (parsedGame.game_date) {
        try {
          // Get current year for date parsing
          const currentYear = new Date().getFullYear();
          
          // Check if date string includes a year (4 digits)
          const hasYear = /\d{4}/.test(parsedGame.game_date);
          
          let parsedDate: Date;
          if (hasYear) {
            // Date includes year, parse as-is
            parsedDate = new Date(parsedGame.game_date);
          } else {
            // Date doesn't include year, append current year
            // Format: "Mar 27" -> "Mar 27, 2026"
            parsedDate = new Date(`${parsedGame.game_date}, ${currentYear}`);
          }
          
          if (!isNaN(parsedDate.getTime())) {
            const year = parsedDate.getFullYear();
            const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
            const day = String(parsedDate.getDate()).padStart(2, '0');
            gameDate = `${year}-${month}-${day}`;
          } else {
            // If parsing fails, use dateStr (today)
            gameDate = dateStr;
          }
        } catch {
          // If parsing fails, use dateStr (today)
          gameDate = dateStr;
        }
      }

      gameInputs.push({
        date: gameDate,
        homeTeamId,
        awayTeamId,
        homeScore: null, // Scores not available from SerpApi games endpoint yet
        awayScore: null,
        status: gameStatus,
      });
    }

    log('info', `Successfully converted ${gameInputs.length} games`);
  } else {
    log('info', 'No games found - status is NO_GAMES');
  }

  // Persist to database (idempotent upsert)
  if (gameInputs.length > 0) {
    log('info', 'Persisting games to database...');
    const dbRows = await upsertGames(gameInputs);
    log('info', `Upsert complete (${dbRows.length} rows)`);
  } else {
    log('info', 'No games to persist');
  }

  log('info', 'Success');
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    const dateStr = parseDateArg();
    await runGamesForDate(dateStr);
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('error', errorMessage);
    process.exit(1);
  }
}

// Execute the script
main();
