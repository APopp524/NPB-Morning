import { getSupabaseClient } from './supabase'
import type { NewsArticle } from '@/src/types/news'

const MAX_ARTICLES = 6
const DAYS_BACK = 30

export async function getTeamNews(teamId: string): Promise<NewsArticle[]> {
  const supabase = getSupabaseClient()

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - DAYS_BACK)
  const cutoffISO = cutoff.toISOString()

  const { data, error } = await supabase
    .from('news_articles')
    .select('id, title, link, source_name, source_icon, thumbnail, thumbnail_small, published_at, fetched_at, team_id')
    .eq('team_id', teamId)
    .or(`published_at.gte.${cutoffISO},and(published_at.is.null,fetched_at.gte.${cutoffISO})`)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(MAX_ARTICLES)

  if (error) {
    console.error(`Failed to fetch team news for ${teamId}:`, error.message)
    return []
  }

  return (data ?? []) as NewsArticle[]
}
