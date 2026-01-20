import Link from 'next/link'
import type { StandingWithTeam } from '@/src/types/standingsWithTeam'
import { TeamIdentity } from './TeamIdentity'

interface StandingsSnapshotProps {
  central: StandingWithTeam[]
  pacific: StandingWithTeam[]
}

export function StandingsSnapshot({ central, pacific }: StandingsSnapshotProps) {
  const topCentral = central.slice(0, 3)
  const topPacific = pacific.slice(0, 3)

  const formatGamesBack = (gamesBack: number | null) => {
    if (gamesBack === null || gamesBack === 0) {
      return '—'
    }
    return gamesBack.toFixed(1)
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Standings</h2>
        <Link
          href="/standings"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          View full standings →
        </Link>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Central League */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Central League
          </h3>
          <div className="space-y-2">
            {topCentral.map((standing, index) => (
              <div
                key={standing.id}
                className="flex items-center justify-between py-2"
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
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Pacific League
          </h3>
          <div className="space-y-2">
            {topPacific.map((standing, index) => (
              <div
                key={standing.id}
                className="flex items-center justify-between py-2"
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
