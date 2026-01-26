import { getStandings } from '@/src/lib/getStandings'
import { GamesSection } from '@/src/components/games/GamesSection'
import { StandingsSnapshot } from '@/src/components/StandingsSnapshot'

function formatTodayDate(): string {
  const today = new Date()
  return today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function Home() {
  // Fetch standings data
  let standingsData

  try {
    standingsData = await getStandings()
  } catch (error) {
    console.error('Failed to fetch standings:', error)
    // Continue without standings - we'll handle gracefully
  }

  const todayDate = formatTodayDate()

  return (
    <>
      {/* Header / Hero */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">NPB Morning</h1>
        <p className="text-lg text-gray-600 mb-3">
          Your daily snapshot of Japanese baseball
        </p>
        <p className="text-sm text-gray-500">{todayDate}</p>
      </header>

      {/* Today's Games - PRIMARY SECTION */}
      <GamesSection />

      {/* Standings Snapshot */}
      {standingsData && (
        <StandingsSnapshot
          central={standingsData.central}
          pacific={standingsData.pacific}
        />
      )}
    </>
  )
}
