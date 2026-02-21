# NPB Morning

**Your daily snapshot of Japanese baseball.**

<npb-morning.vercel.app>

NPB Morning is a web application that aggregates and presents daily information about Nippon Professional Baseball (NPB). It provides fans — especially English-speaking ones — with a quick, at-a-glance morning overview of what's happening across the league.

## What It Does

- **Today's Games** — See the day's matchups, scores, and results at a glance.
- **League Standings** — Up-to-date standings for both the Central and Pacific leagues.
- **News** — Curated NPB news articles from around the web.
- **Teams** — Browse all 12 NPB teams with details and branding.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, TypeScript, Fastify
- **Database**: Supabase (PostgreSQL)
- **Data Provider**: SerpApi (Google search results parsing)
- **Scheduling**: GitHub Actions (nightly cron jobs for games, standings, and news, etc)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Disclaimer

NPB Morning is an independent, fan-built project and is **not affiliated with, endorsed by, or sponsored by** Nippon Professional Baseball (NPB) or any NPB team. Team names and logos are trademarks of their respective owners and are used for informational purposes only. All data is sourced from publicly available information.
