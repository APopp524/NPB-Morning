import type { NewsArticle } from '@/src/types/news'

interface TeamNewsProps {
  articles: NewsArticle[]
}

function formatPublishedDate(isoDate: string | null): string {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function NewsCard({ article }: { article: NewsArticle }) {
  const thumbnail = article.thumbnail || article.thumbnail_small

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors rounded min-w-0"
    >
      {thumbnail && (
        <div className="flex-shrink-0 w-20 h-14 rounded overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {article.source_icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.source_icon}
              alt=""
              className="w-4 h-4 rounded-sm"
              loading="lazy"
            />
          )}
          {article.source_name && (
            <span className="text-xs text-gray-500 truncate max-w-24 sm:max-w-32">
              {article.source_name}
            </span>
          )}
          {article.published_at && (
            <>
              <span className="text-xs text-gray-400">&middot;</span>
              <span className="text-xs text-gray-500">
                {formatPublishedDate(article.published_at)}
              </span>
            </>
          )}
        </div>
      </div>
    </a>
  )
}

export function TeamNews({ articles }: TeamNewsProps) {
  if (articles.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Team News
        </h2>
        <p className="text-sm text-gray-500">
          No recent news articles for this team.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Team News</h2>
      <div className="space-y-1">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
