import { getTeams } from '@/src/lib/getTeams'
import { TeamList } from '@/src/components/TeamList'

export default async function TeamsPage() {
  let teamsData

  try {
    teamsData = await getTeams()
  } catch (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Teams</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to load teams. Please try again later.
          </p>
          {error instanceof Error && (
            <p className="text-red-600 text-sm mt-2">{error.message}</p>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Teams</h1>

      <TeamList title="Central League" teams={teamsData.central} />
      <TeamList title="Pacific League" teams={teamsData.pacific} />
    </main>
  )
}
