# [NPB Morning](https://npb-morning.vercel.app/)

**Your daily snapshot of Japanese baseball.**

NPB Morning is a web application that aggregates and presents daily information about Nippon Professional Baseball (NPB). It provides fans — especially English-speaking ones — with a quick, at-a-glance morning overview of what's happening across the league.

## What It Does

- **Today's Games** — See the day's matchups, scores, and results at a glance.
- **League Standings** — Up-to-date standings for both the Central and Pacific leagues.
- **News** — Curated NPB news articles from around the web, tagged by team.
- **Teams** — Browse all 12 NPB teams with logos, stadium info, social links, and league placement.
- **Team Details** — Dedicated pages per team with latest YouTube videos and team-specific news.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Node.js 20+, TypeScript, Fastify
- **Database**: Supabase (PostgreSQL)
- **Data Providers**:
  - SerpApi — games, standings, and news
  - YouTube RSS feeds — team channel videos (no API key required)
- **Scheduling**: GitHub Actions (nightly cron jobs)

## Cron Jobs

| Script | Command | Data Source | Schedule |
|--------|---------|-------------|----------|
| Games | `npm run games:run` | SerpApi | Nightly |
| Standings | `npm run standings:run` | SerpApi | Nightly |
| News | `npm run news:run` | SerpApi (Google News) | Nightly |
| Videos | `npm run videos:run` | YouTube RSS feeds | Nightly |

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Disclaimer

NPB Morning is an independent, fan-built project and is **not affiliated with, endorsed by, or sponsored by** Nippon Professional Baseball (NPB) or any NPB team. Team names and logos are trademarks of their respective owners and are used for informational purposes only. All data is sourced from publicly available information.
