import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTeam } from '@/src/lib/getTeam'
import { getTeamNews } from '@/src/lib/getTeamNews'
import { getTeamVideos } from '@/src/lib/getTeamVideos'
import { TeamHero } from '@/src/components/team-detail/TeamHero'
import { TeamInfo } from '@/src/components/team-detail/TeamInfo'
import { TeamNews } from '@/src/components/team-detail/TeamNews'
import { TeamVideos } from '@/src/components/team-detail/TeamVideos'

interface TeamPageProps {
  params: Promise<{ id: string }>
}

export default async function TeamDetailPage({ params }: TeamPageProps) {
  const { id } = await params

  let team
  try {
    team = await getTeam(id)
  } catch {
    notFound()
  }

  const [newsResult, videosResult] = await Promise.allSettled([
    getTeamNews(team.id),
    getTeamVideos(team.id),
  ])

  const news = newsResult.status === 'fulfilled' ? newsResult.value : []
  const videos = videosResult.status === 'fulfilled' ? videosResult.value : []

  if (newsResult.status === 'rejected') {
    console.error('Failed to fetch team news:', newsResult.reason)
  }
  if (videosResult.status === 'rejected') {
    console.error('Failed to fetch team videos:', videosResult.reason)
  }

  return (
    <>
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/teams"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to Teams
        </Link>
      </div>

      {/* Hero */}
      <TeamHero team={team} />

      {/* Team Info */}
      <div className="mt-8">
        <TeamInfo team={team} />
      </div>

      {/* News & Videos */}
      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <TeamNews articles={news} />
        <TeamVideos videos={videos} />
      </div>
    </>
  )
}
