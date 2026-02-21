import { getSupabaseClient } from './supabase'
import type { YouTubeVideo } from '@/src/types/teams'

const MAX_VIDEOS = 6

/**
 * Fetch YouTube highlight videos for a team from the database.
 * Videos are populated by the backend cron job (npm run videos:run).
 */
export async function getTeamVideos(
  teamId: string
): Promise<YouTubeVideo[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('team_videos')
    .select(
      'video_id, title, link, thumbnail, published_at, channel_name'
    )
    .eq('team_id', teamId)
    .order('published_at', { ascending: false })
    .limit(MAX_VIDEOS)

  if (error) {
    console.error(`Failed to fetch team videos for ${teamId}:`, error.message)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  return data.map((row) => ({
    videoId: row.video_id,
    title: row.title,
    link: row.link,
    thumbnail: row.thumbnail,
    publishedAt: row.published_at,
    channelName: row.channel_name,
  }))
}
