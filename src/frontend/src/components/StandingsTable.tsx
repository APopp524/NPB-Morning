import type { StandingWithTeam } from '@/src/types/standingsWithTeam'
import { TeamIdentity } from './TeamIdentity'

type SortField = 'wins' | 'losses' | 'games_back'
type SortDirection = 'asc' | 'desc'

interface StandingsTableProps {
  standings: StandingWithTeam[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}

export function StandingsTable({
  standings,
  sortField,
  sortDirection,
  onSort,
}: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="mb-8">
        <p className="text-gray-600">No standings available</p>
      </div>
    )
  }

  // Determine if a team is in first place (games_back is 0 or null)
  const isFirstPlace = (standing: StandingWithTeam) => {
    return standing.games_back === null || standing.games_back === 0
  }

  // Sortable header component
  const SortableHeader = ({
    field,
    children,
    className = '',
  }: {
    field: SortField
    children: React.ReactNode
    className?: string
  }) => {
    const isActive = sortField === field
    return (
      <th
        className={`${className} cursor-pointer select-none hover:bg-gray-100 transition-colors`}
        onClick={() => onSort(field)}
        role="columnheader"
        aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <div className="flex items-center justify-center gap-1">
          <span>{children}</span>
          {isActive && (
            <span className="text-gray-400" aria-hidden="true">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    )
  }

  return (
    <div className="mb-8">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-4 sm:px-0">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <SortableHeader
                  field="wins"
                  className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  W
                </SortableHeader>
                <SortableHeader
                  field="losses"
                  className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  L
                </SortableHeader>
                {/* Hide Ties on mobile */}
                <th className="hidden sm:table-cell px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  T
                </th>
                {/* Hide Pct on mobile */}
                <th className="hidden sm:table-cell px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pct
                </th>
                <SortableHeader
                  field="games_back"
                  className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  GB
                </SortableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {standings.map((standing, index) => {
                const position = index + 1
                const pctDisplay =
                  standing.pct !== null && standing.pct !== undefined
                    ? standing.pct.toFixed(3)
                    : '—'
                const gamesBackDisplay =
                  standing.games_back !== null &&
                  standing.games_back !== undefined &&
                  standing.games_back !== 0
                    ? standing.games_back.toFixed(1)
                    : '—'
                const firstPlace = isFirstPlace(standing)

                return (
                  <TeamRow
                    key={standing.id}
                    standing={standing}
                    position={position}
                    pctDisplay={pctDisplay}
                    gamesBackDisplay={gamesBackDisplay}
                    isFirstPlace={firstPlace}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TeamRow({
  standing,
  position,
  pctDisplay,
  gamesBackDisplay,
  isFirstPlace,
}: {
  standing: StandingWithTeam
  position: number
  pctDisplay: string
  gamesBackDisplay: string
  isFirstPlace: boolean
}) {
  return (
    <tr
      className={`hover:bg-gray-50 ${
        isFirstPlace ? 'bg-blue-50/50 font-semibold' : ''
      }`}
    >
      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
        {position}
      </td>
      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        <div className="flex flex-col gap-1">
          <TeamIdentity
            name={standing.team.name_en}
            thumbnailUrl={standing.team.thumbnail_url}
            size={32}
          />
          <div className="text-xs text-gray-500 ml-10">{standing.team.name}</div>
        </div>
      </td>
      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
        {standing.wins}
      </td>
      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
        {standing.losses}
      </td>
      {/* Hide Ties on mobile */}
      <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
        {standing.ties}
      </td>
      {/* Hide Pct on mobile */}
      <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
        {pctDisplay}
      </td>
      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
        {gamesBackDisplay}
      </td>
    </tr>
  )
}
