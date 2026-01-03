# NPB Morning Backend

A clean MVP backend for NPB (Nippon Professional Baseball) data aggregation.

## Tech Stack

- **Node.js** with **TypeScript**
- **Fastify** web framework
- **Supabase** (PostgreSQL)
- **SerpApi** as data provider (supports both mock and live modes)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your Supabase credentials:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `SERPAPI_KEY`: (Optional) SerpApi key for live mode (required when using live mode)
- `PORT`: (Optional) Server port (default: 3000)
- `HOST`: (Optional) Server host (default: 0.0.0.0)

3. Run database migrations:
   - Run `supabase/migrations/001_initial_schema.sql` to create tables
   - Run `supabase/migrations/002_seed_teams.sql` to seed the 12 NPB teams
   
   Teams are static configuration data seeded via migration. They are never fetched or updated at runtime.

5. Start the server:
```bash
npm run dev
```

## API Endpoints

### `GET /health`
Health check endpoint.

### `GET /cron/daily`
Daily cron job that fetches and upserts NPB data (games and standings).

**Important:** This endpoint assumes teams already exist in the database. Teams are static configuration data seeded via migration (`supabase/migrations/002_seed_teams.sql`). The server will fail to start if teams are missing.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format (default: today)
- `season` (optional): Season year (default: current year)

**Response:**
```json
{
  "success": true,
  "date": "2024-01-15",
  "season": 2024,
  "counts": {
    "games": 6,
    "standings": 12
  }
}
```

**Note:** Teams are NOT fetched or updated by this endpoint. They are treated as configuration data, not part of the data feed.

## Teams Configuration

NPB teams are static configuration data. They are seeded via database migration and never fetched or updated at runtime.

### Why Migration-Based Teams?

- **Configuration vs Data**: Teams are infrastructure/configuration, not time-series data. Treating them as such prevents accidental modifications.
- **API Risk Reduction**: Eliminates external API dependency for teams. No risk of API failures affecting team data.
- **Deterministic IDs**: Teams use canonical string IDs (e.g., `yomiuri-giants`) seeded in migration, ensuring consistency.
- **Explicit Failures**: If teams are missing, the server fails loudly at startup rather than silently creating incomplete data.
- **Simplified Providers**: Providers only need to handle games and standings, not teams.

### How Teams Are Seeded

Teams are seeded via database migration:

1. Run the initial schema migration: `supabase/migrations/001_initial_schema.sql`
2. Run the teams seed migration: `supabase/migrations/002_seed_teams.sql`

The migration inserts all 12 NPB teams with:
- Canonical IDs (e.g., `yomiuri-giants`)
- Japanese names (e.g., `読売ジャイアンツ`)
- English names (e.g., `Yomiuri Giants`)
- League assignment (`central` or `pacific`)

### What Happens If Teams Are Missing?

- **Server Startup**: The server will fail to start with a clear error message if teams are missing or if the count is not exactly 12.
- **Cron Jobs**: Cron jobs assume teams exist and will fail loudly if they do not. This prevents silent data drift.

### Teams Are Never Fetched by Providers or Cron

- **Providers**: The `NPBDataProvider` interface does NOT include `fetchTeams()`. Providers only return games and standings.
- **Cron Jobs**: The cron endpoint (`/cron/daily`) does NOT fetch teams. It only fetches:
  - Games (daily event data)
  - Standings (seasonal data)

Teams are validated at server startup, and cron assumes they already exist.

### Adding or Modifying Teams

To add or modify teams:

1. Create a new migration file (e.g., `003_update_teams.sql`)
2. Use `INSERT ... ON CONFLICT DO UPDATE` or `UPDATE` statements
3. Run the migration via your Supabase migration tooling

**Important**: Never fetch or upsert teams at runtime. Teams are configuration data managed via migrations only.

## Provider Modes

The `SerpApiProvider` supports two modes:

### Mock Mode (Default)

Mock mode returns hardcoded test data. This is the default mode and is used for:
- Local development without API keys
- Testing (all tests use mock mode)
- Avoiding API rate limits during development

To use mock mode (default):
```typescript
const provider = new SerpApiProvider(); // or new SerpApiProvider(undefined, 'mock')
```

### Live Mode

Live mode makes real HTTP requests to SerpApi and parses actual standings data. Use this for:
- Production deployments
- Local testing with real data
- Validating SerpApi response structure

To enable live mode:
```typescript
// Option 1: Pass API key and mode explicitly
const provider = new SerpApiProvider('your-api-key', 'live');

// Option 2: Use environment variable
// Set SERPAPI_KEY in your .env file
const provider = new SerpApiProvider(undefined, 'live');
```

**Important Notes:**
- Live mode requires a valid `SERPAPI_KEY` environment variable or constructor parameter
- The provider will fail loudly if the API key is missing in live mode
- Standings data is parsed from SerpApi's response structure (sports_results, knowledge_graph, or tables)
- All team names are normalized to existing team IDs (teams must be seeded via migration)
- If a team cannot be normalized, the provider throws an error (no silent fallbacks)

### Standings Data Source

Standings are fetched from SerpApi using **team-anchored queries**. Each league is fetched separately using a representative team from that league to ensure reliable data retrieval.

**Why Team-Anchored Queries?**

SerpApi league-only queries (e.g., `"NPB Central League standings 2026"`) often fail to return `sports_results`. Team-anchored queries (e.g., `"Yomiuri Giants standings 2026"`) are much more reliable and consistently return `sports_results.league.standings` with the full league standings.

**Anchor Teams:**
- **Central League**: `"Yomiuri Giants standings {season}"`
- **Pacific League**: `"Fukuoka SoftBank Hawks standings {season}"`

These anchor teams are chosen because:
- They are well-known teams that reliably trigger SerpApi's sports_results
- They belong to their respective leagues (validated against TEAM_LEAGUE_MAP)
- Their queries consistently return complete league standings (all 6 teams)

**Query Strategy:**
- Engine: `google`
- Query format: `"{anchorTeam} standings {season}"`
- Response path: `sports_results.league.standings` (array of standing rows)
- Each league query returns exactly 6 teams (the full league standings)
- Both leagues are fetched in parallel for efficiency

**Validation:**
- Each league must return exactly 6 teams (no more, no less)
- League integrity is validated: teams must belong to the expected league
- Cross-league contamination is detected and rejected (e.g., Central team in Pacific results)
- Duplicate teamId + season combinations are detected and rejected
- Total standings count must be exactly 12 (6 per league)

**Error Handling:**
If no standings data is found, the provider throws a clear error including:
- League name
- Query string used
- SerpApi search ID (for debugging)
- Note that team-based queries are required for reliable sports_results

**Manual Execution Flow:**
1. Script calls `fetchStandingsForBothLeagues(season)`
2. Provider fetches Central League using `"Yomiuri Giants standings {season}"`
3. Provider fetches Pacific League using `"Fukuoka SoftBank Hawks standings {season}"`
4. Both queries are executed in parallel
5. Results are validated (6 teams per league, no duplicates, league integrity)
6. Results are merged and persisted to database
7. Success logs show: `[standings] Central League: 6 teams`, `[standings] Pacific League: 6 teams`, `[standings] Total rows persisted: 12`

## Manual Scripts

### `run-standings.ts` - One-shot Standings Runner (Pre-Cron)

A manual script to fetch and persist NPB standings for a given season. This script is intended for manual execution only, as a validation step before adding cron automation.

**Purpose:**
- Validate standings fetching and persistence before implementing cron automation
- Manually test the SerpApi provider in live mode
- Verify database upsert logic for standings

**How to run:**

```bash
# Using npm script (recommended)
# Unix/Linux/Mac
SERPAPI_KEY=your_key npm run run:standings

# Windows PowerShell
$env:SERPAPI_KEY="your_key"; npm run run:standings

# Windows CMD
set SERPAPI_KEY=your_key && npm run run:standings

# Or using npx/tsx directly
# Unix/Linux/Mac
SERPAPI_KEY=your_key npx tsx src/scripts/run-standings.ts

# Windows PowerShell
$env:SERPAPI_KEY="your_key"; npx tsx src/scripts/run-standings.ts

# Windows CMD
set SERPAPI_KEY=your_key && npx tsx src/scripts/run-standings.ts
```

**What it does:**
1. Loads environment variables from `.env` file (if present)
2. Validates that `SERPAPI_KEY` environment variable is set
3. Validates that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
4. Instantiates `SerpApiProvider` in live mode
5. Fetches standings for both leagues (Central and Pacific) for season 2026 (hardcoded)
6. Validates that each league returns exactly 6 teams
7. Validates that there are no duplicate teamId + season combinations
8. Persists standings to the database using idempotent upserts
9. Validates that exactly 12 rows were persisted (6 per league)
10. Logs clear progress messages throughout execution, including league-specific counts

**Success Criteria:**
- Exactly 12 standings rows are persisted (6 Central League + 6 Pacific League)
- Each team appears exactly once per season
- League integrity is maintained (teams match their expected league)
- Log output shows:
  - `[standings] Central League: 6 teams`
  - `[standings] Pacific League: 6 teams`
  - `[standings] Total rows persisted: 12`

**Environment Variables:**
- `SERPAPI_KEY` (required): Your SerpApi API key
- `SUPABASE_URL` (required): Your Supabase project URL
- `SUPABASE_ANON_KEY` (required): Your Supabase anonymous key

These can be set in a `.env` file in the project root, or as environment variables when running the script.

**Database behavior:**
- Uses `upsertStandings()` helper function
- Idempotent upserts keyed by `(team_id, season)`
- Updates: wins, losses, ties, games_back, pct, home_record, away_record, last_10, league
- Does not delete rows

**Note:** This is a manual pre-cron validation script. Cron automation will be added later once validated.

## Testing

Run tests:
```bash
npm test
```

Tests use mocked responses and don't make real API calls. The test suite includes:
- Cron route integration tests
- Provider error handling tests (live mode validation)
- Mock mode functionality tests

## Architecture

- **Provider-agnostic**: Data providers implement the `NPBDataProvider` interface
- **Idempotent upserts**: All database operations use deterministic IDs
- **Defensive normalization**: Data is normalized before storage
- **Testable**: All external dependencies are mocked in tests
- **Mode switching**: Providers support both mock and live modes for flexible development and production use

## Project Structure

```
src/
  backend/
    models/          # Domain models (Team, Game, Standing)
    providers/       # Data provider interfaces and implementations
    db/              # Supabase database utilities
    routes/          # Fastify route handlers
    utils/           # Shared utilities
    index.ts         # Fastify server entry point
  __tests__/         # Test files and fixtures
supabase/
  migrations/        # Database migrations
    001_initial_schema.sql  # Initial schema (tables)
    002_seed_teams.sql      # Teams seed data
```

