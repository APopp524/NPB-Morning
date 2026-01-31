'use client'

import { useState, useCallback } from 'react'
import type { NewsArticle } from '@/src/types/news'
import { getNewsPage } from '@/src/lib/getNews'

interface NewsSectionProps {
  initialArticles: NewsArticle[]
  initialHasMore: boolean
}

/**
 * Format the published date for display.
 * Shows relative time for recent articles, date for older ones.
 */
function formatPublishedDate(isoDate: string | null): string {
  if (!isoDate) {
    return ''
  }

  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) {
    return 'Just now'
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }
}

function NewsCard({ article }: { article: NewsArticle }) {
  const thumbnail = article.thumbnail || article.thumbnail_small

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors -mx-2 px-2 rounded"
    >
      {/* Thumbnail */}
      {thumbnail && (
        <div className="flex-shrink-0 w-20 h-14 rounded overflow-hidden bg-gray-100">
          <img
            src={thumbnail}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {article.title}
        </h3>

        {/* Source and Date */}
        <div className="flex items-center gap-2 mt-1">
          {article.source_icon && (
            <img
              src={article.source_icon}
              alt=""
              className="w-4 h-4 rounded-sm"
              loading="lazy"
            />
          )}
          {article.source_name && (
            <span className="text-xs text-gray-500 truncate">
              {article.source_name}
            </span>
          )}
          {article.published_at && (
            <>
              <span className="text-xs text-gray-400">·</span>
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

export function NewsSection({ initialArticles, initialHasMore }: NewsSectionProps) {
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoading, setIsLoading] = useState(false)

  const goToPage = useCallback(async (newPage: number) => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const result = await getNewsPage(newPage)
      if (result && result.articles.length > 0) {
        setArticles(result.articles)
        setPage(newPage)
        setHasMore(result.hasMore ?? false)
      }
    } catch (error) {
      console.error('Failed to load news page:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const goNext = useCallback(() => {
    if (hasMore) {
      goToPage(page + 1)
    }
  }, [goToPage, hasMore, page])

  const goPrev = useCallback(() => {
    if (page > 0) {
      goToPage(page - 1)
    }
  }, [goToPage, page])

  if (articles.length === 0) {
    return null
  }

  const hasPrev = page > 0

  return (
    <section className="flex flex-col h-full w-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest News</h2>
      
      <div className={`space-y-1 flex-1 ${isLoading ? 'opacity-50' : ''}`}>
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination - aligned with standings footer */}
      <div className="flex items-center justify-between mt-4 pt-2">
        <button
          onClick={goPrev}
          disabled={!hasPrev || isLoading}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        
        <span className="text-xs text-gray-400">
          Page {page + 1}
        </span>

        <button
          onClick={goNext}
          disabled={!hasMore || isLoading}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </section>
  )
}
