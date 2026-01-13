import { getTeams } from '@/src/lib/getTeams'
import { TeamList } from '@/src/components/TeamList'
import { PageHeader } from '@/src/components/PageHeader'

export default async function TeamsPage() {
  let teamsData

  try {
    teamsData = await getTeams()
  } catch (error) {
    return (
      <>
        <PageHeader title="Teams" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Failed to load teams. Please try again later.
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
      <PageHeader title="Teams" />
      <TeamList title="Central League" teams={teamsData.central} />
      <TeamList title="Pacific League" teams={teamsData.pacific} />
    </>
  )
}
