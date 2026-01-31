import Link from 'next/link'
import type { StandingWithTeam } from '@/src/types/standingsWithTeam'
import { TeamIdentity } from './TeamIdentity'

interface StandingsSnapshotProps {
  central: StandingWithTeam[]
  pacific: StandingWithTeam[]
}

export function StandingsSnapshot({ central, pacific }: StandingsSnapshotProps) {
  const formatGamesBack = (gamesBack: number | null) => {
    if (gamesBack === null || gamesBack === 0) {
      return '—'
    }
    return gamesBack.toFixed(1)
  }

  return (
    <section className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Standings</h2>
        <Link
          href="/standings"
          className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          View Details →
        </Link>
      </div>
      
      <div className="space-y-5 flex-1">
        {/* Central League */}
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Central League
          </h3>
          <div className="space-y-1">
            {central.map((standing, index) => (
              <div
                key={standing.id}
                className="flex items-center justify-between py-1.5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-4">
                    {index + 1}
                  </span>
                  <TeamIdentity
                    name={standing.team.name_en}
                    thumbnailUrl={standing.team.thumbnail_url}
                    size={20}
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{standing.wins}-{standing.losses}</span>
                  <span className="w-8 text-right">{formatGamesBack(standing.games_back)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pacific League */}
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Pacific League
          </h3>
          <div className="space-y-1">
            {pacific.map((standing, index) => (
              <div
                key={standing.id}
                className="flex items-center justify-between py-1.5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-4">
                    {index + 1}
                  </span>
                  <TeamIdentity
                    name={standing.team.name_en}
                    thumbnailUrl={standing.team.thumbnail_url}
                    size={20}
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{standing.wins}-{standing.losses}</span>
                  <span className="w-8 text-right">{formatGamesBack(standing.games_back)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}
