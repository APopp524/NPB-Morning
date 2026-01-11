import { useState } from 'react'
import type { StandingWithTeam } from '@/src/types/standingsWithTeam'

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
  const [imageError, setImageError] = useState(false)
  const showThumbnail = standing.team.thumbnail_url && !imageError

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
        {position}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        <div className="flex items-center gap-2">
          {showThumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={standing.team.thumbnail_url!}
              alt={standing.team.name_en}
              className="w-8 h-8 object-contain flex-shrink-0"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
              {standing.team.name_en.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-medium">{standing.team.name_en}</div>
            <div className="text-xs text-gray-500">{standing.team.name}</div>
          </div>
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

