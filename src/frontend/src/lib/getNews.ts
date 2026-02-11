import { getSupabaseClient } from './supabase'
import type { NewsArticle, NewsResponse } from '@/src/types/news'

const PAGE_SIZE = 6
const DAYS_BACK = 30

/**
 * Get the cutoff date for news articles (30 days ago)
 */
function getCutoffDate(): Date {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - DAYS_BACK)
  return cutoffDate
}

/**
 * Fetch recent news articles from the database.
 * Filters by published_at (with fetched_at fallback for articles without a publish date).
 * Returns up to PAGE_SIZE articles from the last 30 days, plus info about whether more exist.
 * 
 * @returns NewsResponse with articles array, or null if no articles found
 */
export async function getNews(): Promise<NewsResponse | null> {
  const supabase = getSupabaseClient()
  const cutoffISO = getCutoffDate().toISOString()

  // Fetch one extra to check if there are more articles
  // Filter: published_at >= cutoff, OR (published_at is null AND fetched_at >= cutoff)
  const { data, error } = await supabase
    .from('news_articles')
    .select(`
      id,
      title,
      link,
      source_name,
      source_icon,
      thumbnail,
      thumbnail_small,
      published_at,
      fetched_at
    `)
    .or(`published_at.gte.${cutoffISO},and(published_at.is.null,fetched_at.gte.${cutoffISO})`)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(PAGE_SIZE + 1)

  if (error) {
    console.error('Failed to fetch news:', error.message)
    return null
  }

  if (!data || data.length === 0) {
    return null
  }

  // Check if there are more articles beyond this page
  const hasMore = data.length > PAGE_SIZE
  const articlesData = hasMore ? data.slice(0, PAGE_SIZE) : data

  const articles: NewsArticle[] = articlesData.map((row) => ({
    id: row.id,
    title: row.title,
    link: row.link,
    source_name: row.source_name,
    source_icon: row.source_icon,
    thumbnail: row.thumbnail,
    thumbnail_small: row.thumbnail_small,
    published_at: row.published_at,
    fetched_at: row.fetched_at,
  }))

  // Get the most recent fetched_at for display
  const latestFetchedAt = articles.length > 0 ? articles[0].fetched_at : null

  return {
    articles,
    fetched_at: latestFetchedAt,
    hasMore,
  }
}

/**
 * Fetch a specific page of news articles (client-side).
 * @param page Page number (0-indexed)
 * @returns NewsResponse with the page of articles
 */
export async function getNewsPage(page: number): Promise<NewsResponse | null> {
  const supabase = getSupabaseClient()
  const cutoffISO = getCutoffDate().toISOString()
  const offset = page * PAGE_SIZE

  // Fetch one extra to check if there are more articles
  // Filter: published_at >= cutoff, OR (published_at is null AND fetched_at >= cutoff)
  const { data, error } = await supabase
    .from('news_articles')
    .select(`
      id,
      title,
      link,
      source_name,
      source_icon,
      thumbnail,
      thumbnail_small,
      published_at,
      fetched_at
    `)
    .or(`published_at.gte.${cutoffISO},and(published_at.is.null,fetched_at.gte.${cutoffISO})`)
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + PAGE_SIZE)

  if (error) {
    console.error('Failed to fetch news page:', error.message)
    return null
  }

  if (!data || data.length === 0) {
    return {
      articles: [],
      fetched_at: null,
      hasMore: false,
    }
  }

  // Check if there are more articles beyond this page
  const hasMore = data.length > PAGE_SIZE
  const articlesData = hasMore ? data.slice(0, PAGE_SIZE) : data

  const articles: NewsArticle[] = articlesData.map((row) => ({
    id: row.id,
    title: row.title,
    link: row.link,
    source_name: row.source_name,
    source_icon: row.source_icon,
    thumbnail: row.thumbnail,
    thumbnail_small: row.thumbnail_small,
    published_at: row.published_at,
    fetched_at: row.fetched_at,
  }))

  return {
    articles,
    fetched_at: null,
    hasMore,
  }
}
