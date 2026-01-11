import type { StandingWithTeam } from '@/src/types/standingsWithTeam'
import { TeamIdentity } from './TeamIdentity'

interface StandingsTableProps {
  title: string
  standings: StandingWithTeam[]
}

export function StandingsTable({ title, standings }: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600">No standings available</p>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                W
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                L
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                T
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pct
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                GB
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {standings.map((standing, index) => {
              const position = index + 1
              const pctDisplay = standing.pct !== null && standing.pct !== undefined
                ? standing.pct.toFixed(3)
                : '—'
              const gamesBackDisplay = standing.games_back !== null && standing.games_back !== undefined && standing.games_back !== 0
                ? standing.games_back.toFixed(1)
                : '—'

              return (
                <TeamRow
                  key={standing.id}
                  standing={standing}
                  position={position}
                  pctDisplay={pctDisplay}
                  gamesBackDisplay={gamesBackDisplay}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TeamRow({
  standing,
  position,
  pctDisplay,
  gamesBackDisplay,
}: {
  standing: StandingWithTeam
  position: number
  pctDisplay: string
  gamesBackDisplay: string
}) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
        {position}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        <div className="flex flex-col gap-1">
          <TeamIdentity
            name={standing.team.name_en}
            thumbnailUrl={standing.team.thumbnail_url}
            size={32}
          />
          <div className="text-xs text-gray-500 ml-10">{standing.team.name}</div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
        {standing.wins}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
        {standing.losses}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
        {standing.ties}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
        {pctDisplay}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
        {gamesBackDisplay}
      </td>
    </tr>
  )
}

