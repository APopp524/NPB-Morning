'use client'

import type { Game } from '@/src/types/games'

interface GameRowProps {
  game: Game
}

export function GameRow({ game }: GameRowProps) {
  // For now, we'll use placeholder data since teams aren't passed in
  // This component is future-ready and will be updated when game data includes team info
  const formatTime = (scheduledStartTime: string) => {
    try {
      const date = new Date(scheduledStartTime)
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    } catch {
      return 'TBD'
    }
  }

  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="text-sm text-gray-500 min-w-[80px]">
            {formatTime(game.scheduled_start_time)}
          </div>
          <div className="flex-1 flex items-center justify-between gap-4">
            <div className="flex-1">
              {/* Away team - will be populated with actual team data later */}
              <div className="text-gray-900">Away Team</div>
            </div>
            <div className="text-gray-400">@</div>
            <div className="flex-1 text-right">
              {/* Home team - will be populated with actual team data later */}
              <div className="text-gray-900">Home Team</div>
            </div>
          </div>
        </div>
        {game.status === 'live' && (
          <div className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
            LIVE
          </div>
        )}
        {game.status === 'final' && game.home_score !== undefined && game.away_score !== undefined && (
          <div className="text-sm font-medium text-gray-900">
            {game.away_score} - {game.home_score}
          </div>
        )}
      </div>
    </div>
  )
}
