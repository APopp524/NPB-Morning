import { getSupabaseClient } from './supabase'
import type { NewsArticle } from '@/src/types/news'

const MAX_ARTICLES = 6
const DAYS_BACK = 30

/**
 * Fetch news articles tagged to a specific team.
 * Returns up to MAX_ARTICLES articles from the last 30 days.
 */
export async function getTeamNews(
  teamId: string
): Promise<NewsArticle[]> {
  const supabase = getSupabaseClient()

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - DAYS_BACK)
  const cutoffISO = cutoffDate.toISOString()

  const { data, error } = await supabase
    .from('news_articles')
    .select(
      `
      id,
      title,
      link,
      source_name,
      source_icon,
      thumbnail,
      thumbnail_small,
      published_at,
      fetched_at,
      team_id
    `
    )
    .eq('team_id', teamId)
    .or(
      `published_at.gte.${cutoffISO},and(published_at.is.null,fetched_at.gte.${cutoffISO})`
    )
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(MAX_ARTICLES)

  if (error) {
    console.error(`Failed to fetch team news for ${teamId}:`, error.message)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    link: row.link,
    source_name: row.source_name,
    source_icon: row.source_icon,
    thumbnail: row.thumbnail,
    thumbnail_small: row.thumbnail_small,
    published_at: row.published_at,
    fetched_at: row.fetched_at,
    team_id: row.team_id ?? null,
  }))
}
