/**
 * News article types for the frontend
 */

export interface NewsArticle {
  id: string
  title: string
  link: string
  source_name: string | null
  source_icon: string | null
  thumbnail: string | null
  thumbnail_small: string | null
  published_at: string | null
  fetched_at: string
}

export interface NewsResponse {
  articles: NewsArticle[]
  fetched_at: string | null
  hasMore?: boolean
}
