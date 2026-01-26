import { getGames, type GamesResponse } from '@/src/lib/getGames'
import { GameRow } from './GameRow'

export async function GamesSection() {
  // Fetch games data on render (server component)
  // Will fetch today's games first, then upcoming games if none found
  const gamesData = await getGames()

  // Handle NO_GAMES state - don't show games
  if (gamesData.status === 'NO_GAMES' || gamesData.games.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Today&apos;s Games</h2>
        <div className="py-12 text-center">
          <p className="text-gray-700 text-lg mb-2">No NPB games are scheduled today.</p>
        </div>
      </section>
    )
  }

  // Determine heading based on status for LIVE and SCHEDULED
  const heading = gamesData.status === 'LIVE' 
    ? "Today&apos;s Games" 
    : "Upcoming Games"

  // Render games list for both LIVE and SCHEDULED states
  // Keep layout identical between states
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">{heading}</h2>
      <div className="space-y-3">
        {gamesData.games.map((game: GamesResponse['games'][0], index: number) => (
          <GameRow
            key={`${game.home_team.name_en}-${game.away_team.name_en}-${index}`}
            homeTeam={game.home_team}
            awayTeam={game.away_team}
            gameDate={game.game_date}
            venue={game.venue_name}
          />
        ))}
      </div>
    </section>
  )
}
