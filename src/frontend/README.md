# NPB Morning Web

Frontend for NPB Morning — a read-only Next.js app displaying Nippon Professional Baseball standings, teams, news, and videos.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Fill in your Supabase credentials in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
REVALIDATE_SECRET=your_secret_token
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Performance

The frontend is optimized for fast page loads with minimal database round trips:

- **Singleton Supabase client** — a single client instance is reused across all requests in the same process, avoiding repeated connection/auth overhead.
- **Minimal queries** — each data-fetching function uses a single Supabase query. For example, `getStandings()` fetches the latest season's standings in one query (ordered by `season DESC`, limited to 12 rows) instead of two sequential queries.
- **Parallel data fetching** — pages that need multiple data sources fire all queries simultaneously via `Promise.allSettled`. The team detail page fetches team info, news, and videos in parallel.
- **ISR caching** — all pages use Next.js Incremental Static Regeneration (`revalidate`) so most requests are served from cache. Data only changes via backend cron jobs, so fresh Supabase queries are only needed periodically:
  - Home page: `revalidate = 60` (1 minute)
  - Standings page: `revalidate = 300` (5 minutes)
  - Teams list: `revalidate = 3600` (1 hour)
  - Team detail: `revalidate = 300` (5 minutes)
- **On-demand revalidation** — a protected `POST /api/revalidate?token=<secret>` endpoint busts the entire ISR cache (`revalidatePath('/', 'layout')`). All four nightly GitHub Actions workflows call this endpoint after data ingestion so users always see fresh data on their first visit after a cron run. Requires `REVALIDATE_SECRET` and `VERCEL_URL` set as GitHub Actions secrets.

## Project Structure

```
app/
  page.tsx                    # Home (games, standings, news)
  standings/page.tsx          # Full standings page
  teams/page.tsx              # Teams list
  teams/[id]/page.tsx         # Team detail page
  api/revalidate/route.ts     # On-demand ISR cache bust endpoint
src/
  components/
    games/
      GamesSection.tsx        # Today's games / upcoming games
      GameCard.tsx            # Individual game card
    team-detail/
      TeamHero.tsx            # Team banner with logo and league
      TeamInfo.tsx            # Stadium, city, social links
      TeamNews.tsx            # Team-specific news articles
      TeamVideos.tsx          # Latest YouTube videos
    StandingsSnapshot.tsx     # Compact standings for home page
    StandingsDisplay.tsx      # Full standings table
    NewsSection.tsx           # News feed with client-side pagination
    TeamList.tsx              # Team grid for the teams page
    PageHeader.tsx            # Reusable page header
  lib/
    supabase.ts               # Singleton Supabase client
    getGames.ts               # Fetch today's/upcoming games (single query)
    getStandings.ts           # Fetch latest season standings (single query)
    getTeam.ts                # Fetch single team detail
    getTeams.ts               # Fetch all teams grouped by league
    getTeamNews.ts            # Fetch team-tagged news articles
    getTeamVideos.ts          # Fetch team YouTube videos
    getNews.ts                # Fetch general news feed with pagination
    teamLogos.ts              # Local logo path helpers
  types/
    teams.ts                  # Team, TeamDetail, YouTubeVideo
    news.ts                   # NewsArticle, NewsResponse
    standingsWithTeam.ts      # StandingWithTeam
public/
  logos/                      # Small 48px team logos
  teams/{team-id}/logo.png    # High-res team logos for detail pages
```

