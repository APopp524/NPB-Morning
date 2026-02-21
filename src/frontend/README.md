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
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
app/
  page.tsx                    # Home (games, standings, news)
  teams/page.tsx              # Teams list
  teams/[id]/page.tsx         # Team detail page
src/
  components/
    team-detail/
      TeamHero.tsx            # Team banner with logo and league
      TeamInfo.tsx            # Stadium, city, social links
      TeamNews.tsx            # Team-specific news articles
      TeamVideos.tsx          # Latest YouTube videos
    TeamList.tsx              # Team grid for the teams page
    ...
  lib/
    supabase.ts               # Supabase client
    getTeam.ts                # Fetch single team detail
    getTeamNews.ts            # Fetch team-tagged news articles
    getTeamVideos.ts          # Fetch team YouTube videos
    getNews.ts                # Fetch general news feed
    teamLogos.ts              # Local logo path helpers
    ...
  types/
    teams.ts                  # Team, TeamDetail, YouTubeVideo
    news.ts                   # NewsArticle, NewsResponse
public/
  logos/                      # Small 48px team logos
  teams/{team-id}/logo.png    # High-res team logos for detail pages
```

