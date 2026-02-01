import { getStandings } from '@/src/lib/getStandings'
import { getNews } from '@/src/lib/getNews'
import { GamesSection } from '@/src/components/games/GamesSection'
import { StandingsSnapshot } from '@/src/components/StandingsSnapshot'
import { NewsSection } from '@/src/components/NewsSection'

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
  // Fetch standings and news data in parallel
  const [standingsResult, newsResult] = await Promise.allSettled([
    getStandings(),
    getNews(),
  ])

  const standingsData =
    standingsResult.status === 'fulfilled' ? standingsResult.value : null
  const newsData =
    newsResult.status === 'fulfilled' ? newsResult.value : null

  if (standingsResult.status === 'rejected') {
    console.error('Failed to fetch standings:', standingsResult.reason)
  }
  if (newsResult.status === 'rejected') {
    console.error('Failed to fetch news:', newsResult.reason)
  }

  const todayDate = formatTodayDate()

  // Determine if we have content for the two-column layout
  const hasStandings = standingsData !== null
  const hasNews = newsData !== null && newsData.articles.length > 0

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

      {/* Standings & News - Two Column Layout */}
      {(hasStandings || hasNews) && (
        <div className="grid md:grid-cols-5 gap-8 lg:gap-12 items-stretch">
          {/* Standings - Left Column (2/5 width on md+) */}
          {hasStandings && (
            <div className="md:col-span-2 flex">
              <StandingsSnapshot
                central={standingsData.central}
                pacific={standingsData.pacific}
              />
            </div>
          )}

          {/* News - Right Column (3/5 width on md+) */}
          {hasNews && (
            <div className={`flex min-w-0 ${hasStandings ? 'md:col-span-3' : 'md:col-span-5'}`}>
              <NewsSection
                initialArticles={newsData.articles}
                initialHasMore={newsData.hasMore ?? false}
              />
            </div>
          )}
        </div>
      )}
    </>
  )
}
