import { getStandings } from '@/src/lib/getStandings'
import { StandingsDisplay } from '@/src/components/StandingsDisplay'

export default async function StandingsPage() {
  let standingsData

  try {
    standingsData = await getStandings()
  } catch (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">NPB Standings</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to load standings. Please try again later.
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
      <h1 className="text-3xl font-bold mb-2">NPB Standings</h1>
      <p className="text-gray-600 mb-8">{standingsData.season} Season</p>

      <StandingsDisplay
        central={standingsData.central}
        pacific={standingsData.pacific}
        updatedAt={standingsData.updated_at}
      />
    </main>
  )
}
