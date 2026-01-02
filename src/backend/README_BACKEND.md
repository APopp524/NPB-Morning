# NPB Morning Backend

A clean MVP backend for NPB (Nippon Professional Baseball) data aggregation.

## Tech Stack

- **Node.js** with **TypeScript**
- **Fastify** web framework
- **Supabase** (PostgreSQL)
- **SerpApi** as data provider (mocked for MVP)

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
- `SERPAPI_KEY`: (Optional) SerpApi key for production
- `PORT`: (Optional) Server port (default: 3000)
- `HOST`: (Optional) Server host (default: 0.0.0.0)

3. Run database migrations:
   - Create the tables in Supabase using `supabase/migrations/001_initial_schema.sql`

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### `GET /health`
Health check endpoint.

### `GET /cron/daily`
Daily cron job that fetches and upserts NPB data.

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
    "teams": 12,
    "games": 6,
    "standings": 12
  }
}
```

## Testing

Run tests:
```bash
npm test
```

Tests use mocked responses and don't make real API calls.

## Architecture

- **Provider-agnostic**: Data providers implement the `NPBDataProvider` interface
- **Idempotent upserts**: All database operations use deterministic IDs
- **Defensive normalization**: Data is normalized before storage
- **Testable**: All external dependencies are mocked in tests

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
```

