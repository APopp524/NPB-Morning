# NPB Morning Backend

A clean MVP backend for NPB (Nippon Professional Baseball) data aggregation.

## Tech Stack

- **Node.js 20+** with **TypeScript**
- **Fastify** web framework
- **Supabase** (PostgreSQL)
- **SerpApi** for games, standings, and news (supports mock and live modes)
- **YouTube RSS feeds** for team videos (no API key required)

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
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (preferred for writes)
- `SUPABASE_ANON_KEY`: Your Supabase anon key (fallback if service role key is not set)
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

## Standings Cron

### `run-standings.ts` - Standings Cron Runner (Node.js)

The canonical entrypoint for standings ingestion. This script fetches and persists NPB standings for a given season using shared backend modules, ensuring a single source of truth for all standings logic.

**Location:** `src/scripts/run-standings.ts`

**Purpose:**
- Production-ready, idempotent cron job for nightly standings updates
- Manual execution for testing and validation
- Single source of truth for standings ingestion logic
- Node.js-only execution (no Deno, no Edge Functions)

**Why Node.js-Only?**

We standardized on Node.js-only execution to:
- **Simplify architecture:** One runtime, one deployment target
- **Better tooling:** Full access to Node.js ecosystem and debugging tools
- **External scheduling:** Use external schedulers (GitHub Actions, Railway cron, etc.) for better control and observability
- **Consistency:** All scripts use the same runtime and patterns

**How to run manually:**

```bash
# Default season (current year)
npm run standings:run

# Specific season
npm run standings:run -- --season=2026

# Direct execution
tsx src/scripts/run-standings.ts [--season=2026]
```

**What it does:**
1. Loads environment variables from `.env` file (if present)
2. Validates required environment variables (SERPAPI_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY)
3. Parses CLI arguments for season (defaults to current year)
4. Fetches teams from database (validates exactly 12 teams exist)
5. Fetches standings for both leagues using shared `fetchStandingsForBothLeagues()` function
6. **Hard validation guards (fail fast):**
   - Asserts exactly 12 total standings rows
   - Asserts exactly 6 Central League teams
   - Asserts exactly 6 Pacific League teams
   - Asserts no duplicate (teamId, season) combinations
7. Persists to database using idempotent upserts (ON CONFLICT (team_id, season))
8. Validates persisted data (12 rows)
9. Exits with status code 0 on success, 1 on failure

**Idempotent Upsert Strategy:**

The cron job uses idempotent database writes keyed by `(team_id, season)`:

- **Database constraint:** `UNIQUE(team_id, season)` (defined in migration)
- **Upsert logic:** `INSERT ... ON CONFLICT (team_id, season) DO UPDATE`
- **Updated fields:** wins, losses, ties, games_back, pct, home_record, away_record, last_10, league, updated_at
- **Never deletes rows:** Only updates existing rows or inserts new ones
- **Safe retries:** Rerunning the job is safe (no duplicate rows, no race conditions)

**Why Team-Anchored SerpApi Queries?**

The cron job uses team-anchored queries (e.g., `"Yomiuri Giants standings 2026"`) instead of league-only queries because:

- **Reliability:** SerpApi league-only queries often fail to return `sports_results`
- **Consistency:** Team-anchored queries consistently return complete league standings (all 6 teams)
- **Anchor teams:**
  - **Central League:** `"Yomiuri Giants standings {season}"`
  - **Pacific League:** `"Fukuoka SoftBank Hawks standings {season}"`

**Expected Row Count:**

The cron job expects and validates exactly **12 standings rows**:
- 6 Central League teams
- 6 Pacific League teams

If any validation fails, the job exits with status code 1 and logs an error. No partial data is written to the database.

**Structured Logging:**

All logs use the `[standings][cron]` prefix for easy filtering:

```
[standings][cron] 2026-01-15T03:00:00.000Z Starting standings run
[standings][cron] 2026-01-15T03:00:00.100Z Season: 2026
[standings][cron] 2026-01-15T03:00:00.200Z Found 12 teams in database
[standings][cron] 2026-01-15T03:00:00.300Z Fetching standings for season 2026 from SerpApi...
[standings][cron] 2026-01-15T03:00:05.000Z Central League: 6 teams
[standings][cron] 2026-01-15T03:00:05.100Z Pacific League: 6 teams
[standings][cron] 2026-01-15T03:00:05.200Z Validating standings data...
[standings][cron] 2026-01-15T03:00:05.300Z Persisting standings to database...
[standings][cron] 2026-01-15T03:00:05.500Z Upsert complete (12 rows)
[standings][cron] 2026-01-15T03:00:05.600Z Success
```

On failure:
```
[standings][cron][ERROR] 2026-01-15T03:00:00.000Z <message>
```

**Environment Variables:**

- `SERPAPI_KEY` (required): Your SerpApi API key
- `SUPABASE_URL` (required): Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` (preferred): Your Supabase service role key (for writes)
- `SUPABASE_ANON_KEY` (fallback): Your Supabase anonymous key (used if service role key is not set)

These can be set in a `.env` file in the project root, or as environment variables when running the script.

## Nightly Standings Cron (GitHub Actions)

Standings ingestion runs automatically via GitHub Actions on a nightly schedule. The workflow is configured in `.github/workflows/nightly-standings.yml`.

**Schedule:**
- Runs nightly at **03:00 UTC**
- Can also be triggered manually from the GitHub Actions UI

**How it works:**
1. GitHub Actions triggers the workflow at the scheduled time (or manually)
2. The workflow checks out the repository and sets up Node.js 18
3. Dependencies are installed with `npm ci`
4. The `npm run standings:run` script is executed
5. Secrets are injected as environment variables (managed in GitHub, not `.env`)

**Idempotency:**
The job is **idempotent and safe to re-run**. It uses database upserts keyed by `(team_id, season)`, so:
- Running multiple times produces the same result
- No duplicate rows are created
- No race conditions occur
- Manual triggers are safe for testing

**Manual Trigger:**
To manually trigger the workflow:
1. Go to the **Actions** tab in your GitHub repository
2. Select **Nightly NPB Standings** from the workflow list
3. Click **Run workflow** button
4. Select the branch (usually `main` or `master`)
5. Click **Run workflow** to start

**Secrets Management:**
Secrets are managed in GitHub, not in `.env` files:
- Go to **Settings** → **Secrets and variables** → **Actions**
- Add the following secrets:
  - `SERPAPI_KEY`: Your SerpApi API key
  - `SUPABASE_URL`: Your Supabase project URL
  - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (preferred for writes)

**What NOT to do:**
- ❌ Do NOT use system crontab (use GitHub Actions instead)
- ❌ Do NOT introduce Supabase Edge Functions (we use Node.js-only)
- ❌ Do NOT commit secrets to the repository
- ❌ Do NOT add scheduler logic inside Node scripts (cron responsibility lives in GitHub Actions)

**Error Handling:**

The cron job fails fast with clear error messages:
- Missing environment variables → exits with status 1
- Invalid season argument → exits with status 1
- Database connection failure → exits with status 1
- Invalid standings data (wrong count, duplicates) → exits with status 1
- SerpApi fetch failure → exits with status 1
- Database write failure → exits with status 1

**Safety Features:**

- ✅ Idempotent writes (safe to rerun)
- ✅ Hard guards (fail fast, no partial writes)
- ✅ Structured logging (cron-friendly observability)
- ✅ No locking required (idempotency eliminates race conditions)
- ✅ No retries needed (fail fast, let cron retry on next run)
- ✅ Single source of truth (all logic in shared backend modules)

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

## Cron Scripts

| Script | Command | Data Source | Description |
|--------|---------|-------------|-------------|
| `run-standings.ts` | `npm run standings:run` | SerpApi | Fetches league standings |
| `run-games.ts` | `npm run games:run` | SerpApi | Fetches daily game results |
| `run-news.ts` | `npm run news:run` | SerpApi (Google News) | Fetches NPB news articles |
| `run-videos.ts` | `npm run videos:run` | YouTube RSS | Fetches latest videos from each team's official YouTube channel |

### Video Cron (`run-videos.ts`)

Fetches the 6 most recent videos from each NPB team's official YouTube channel using their public RSS feed. Each team's `youtube_channel_id` is stored in the `teams` table and was resolved from their `youtube_channel_url`.

- **No API key required** — uses the free YouTube RSS endpoint
- **Idempotent** — uses deterministic IDs for upserts
- **Stale cleanup** — removes videos no longer in the RSS feed
- **Old cleanup** — deletes videos with `fetched_at` older than 30 days

## Project Structure

```
src/
  backend/
    models/            # Domain models (Team, Game, Standing, TeamVideo, NewsArticle)
    providers/
      serpapi/          # SerpApi client, parsers (standings, games, news), team-map
      youtube-rss.ts    # YouTube RSS feed parser for team videos
    db/                 # Supabase database functions (client, news, team-videos)
    routes/             # Fastify route handlers
    utils/              # Shared utilities
    index.ts            # Fastify server entry point
  scripts/
    run-standings.ts    # Standings cron runner
    run-games.ts        # Games cron runner
    run-news.ts         # News cron runner
    run-videos.ts       # Videos cron runner
  __tests__/            # Test files and fixtures
supabase/
  migrations/           # Database migrations (001–013)
```

