import { getStandings } from '@/src/lib/getStandings'
import { StandingsDisplay } from '@/src/components/StandingsDisplay'
import { PageHeader } from '@/src/components/PageHeader'

export default async function StandingsPage() {
  let standingsData

  try {
    standingsData = await getStandings()
  } catch (error) {
    return (
      <>
        <PageHeader title="NPB Standings" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to load standings. Please try again later.
          </p>
          {error instanceof Error && (
            <p className="text-red-600 text-sm mt-2">{error.message}</p>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="NPB Standings"
        subtitle={`${standingsData.season} Season`}
      />
      <StandingsDisplay
        central={standingsData.central}
        pacific={standingsData.pacific}
        updatedAt={standingsData.updated_at}
      />
    </>
  )
}
