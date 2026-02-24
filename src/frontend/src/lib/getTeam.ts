import { getSupabaseClient } from './supabase'
import { getTeamLogoLargeUrl } from './teamLogos'
import type { TeamDetail } from '@/src/types/teams'

export async function getTeam(id: string): Promise<TeamDetail> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('teams')
    .select('id, name, name_en, league, stadium, city, website_url, twitter_url, instagram_url, youtube_channel_url')
    .eq('id', id)
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? `Team not found: ${id}`)
  }

  return {
    ...data,
    thumbnail_url: getTeamLogoLargeUrl(data.id),
    stadium: data.stadium ?? null,
    city: data.city ?? null,
    website_url: data.website_url ?? null,
    twitter_url: data.twitter_url ?? null,
    instagram_url: data.instagram_url ?? null,
    youtube_channel_url: data.youtube_channel_url ?? null,
  }
}
