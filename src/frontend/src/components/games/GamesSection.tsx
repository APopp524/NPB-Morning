'use client'

import type { Game } from '@/src/types/games'
import { GameRow } from './GameRow'

interface GamesSectionProps {
  games: Game[]
}

export function GamesSection({ games }: GamesSectionProps) {
  if (games.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">{`Today's Games`}</h2>
        <div className="py-12 text-center">
          <p className="text-gray-700 text-lg mb-2">No games scheduled today.</p>
          <p className="text-gray-500 text-sm">Standings update overnight.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">{`Today's Games`}</h2>
      <div className="space-y-3">
        {games.map((game) => (
          <GameRow key={game.id} game={game} />
        ))}
      </div>
    </section>
  )
}
