import { getSupabaseClient } from './supabase'
import type { NewsArticle, NewsResponse } from '@/src/types/news'

const PAGE_SIZE = 6
const DAYS_BACK = 30

const NEWS_COLUMNS =
  'id, title, link, source_name, source_icon, thumbnail, thumbnail_small, published_at, fetched_at, team_id'

function getCutoffISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - DAYS_BACK)
  return d.toISOString()
}

export async function getNews(): Promise<NewsResponse | null> {
  const supabase = getSupabaseClient()
  const cutoff = getCutoffISO()

  const { data, error } = await supabase
    .from('news_articles')
    .select(NEWS_COLUMNS)
    .or(`published_at.gte.${cutoff},and(published_at.is.null,fetched_at.gte.${cutoff})`)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(PAGE_SIZE + 1)

  if (error) {
    console.error('Failed to fetch news:', error.message)
    return null
  }

  if (!data || data.length === 0) return null

  const hasMore = data.length > PAGE_SIZE
  const articles = (hasMore ? data.slice(0, PAGE_SIZE) : data) as NewsArticle[]

  return {
    articles,
    fetched_at: articles[0]?.fetched_at ?? null,
    hasMore,
  }
}

export async function getNewsPage(page: number): Promise<NewsResponse | null> {
  const supabase = getSupabaseClient()
  const cutoff = getCutoffISO()
  const offset = page * PAGE_SIZE

  // .range() is inclusive on both ends, so fetch PAGE_SIZE+1 to detect hasMore
  const { data, error } = await supabase
    .from('news_articles')
    .select(NEWS_COLUMNS)
    .or(`published_at.gte.${cutoff},and(published_at.is.null,fetched_at.gte.${cutoff})`)
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + PAGE_SIZE)

  if (error) {
    console.error('Failed to fetch news page:', error.message)
    return null
  }

  if (!data || data.length === 0) {
    return { articles: [], fetched_at: null, hasMore: false }
  }

  const hasMore = data.length > PAGE_SIZE
  const articles = (hasMore ? data.slice(0, PAGE_SIZE) : data) as NewsArticle[]

  return { articles, fetched_at: null, hasMore }
}
