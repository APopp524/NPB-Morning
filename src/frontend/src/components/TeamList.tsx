import type { Team } from '@/src/types/teams'

interface TeamListProps {
  title: string
  teams: Team[]
}

export function TeamList({ title, teams }: TeamListProps) {
  if (teams.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600">No teams available</p>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="font-medium text-gray-900">{team.name_en}</div>
            <div className="text-sm text-gray-500 mt-1">{team.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

