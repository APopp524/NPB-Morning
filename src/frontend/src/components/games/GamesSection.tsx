import { getGames, type GamesResponse } from '@/src/lib/getGames'
import { GameCard } from './GameCard'

export async function GamesSection() {
  // Fetch games data on render (server component)
  // Will fetch today's games first, then upcoming games if none found
  const gamesData = await getGames()

  // Handle NO_GAMES state - don't show games
  if (gamesData.status === 'NO_GAMES' || gamesData.games.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Latest Results</h2>
        <div className="py-12 text-center bg-gray-50 rounded-xl">
          <p className="text-gray-600 text-lg">No recent games to display.</p>
        </div>
      </section>
    )
  }

  // Determine heading - use "Latest Results" for completed games, "Upcoming Games" for scheduled
  const hasCompletedGames = gamesData.games.some(
    (game) => game.home_score !== null && game.away_score !== null
  )
  const heading = hasCompletedGames ? 'Latest Results' : 'Upcoming Games'

  // Render games in a responsive grid
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">{heading}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gamesData.games.map((game: GamesResponse['games'][0], index: number) => (
          <GameCard
            key={`${game.home_team.name_en}-${game.away_team.name_en}-${index}`}
            homeTeam={game.home_team}
            awayTeam={game.away_team}
            homeScore={game.home_score}
            awayScore={game.away_score}
            gameDate={game.game_date}
            venue={game.venue_name}
          />
        ))}
      </div>
    </section>
  )
}
