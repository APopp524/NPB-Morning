import { createHash } from 'crypto';
import { getSupabaseClient } from './client';
import { TeamVideo, TeamVideoInput } from '../models/team-video';

/**
 * Generate a deterministic ID from team_id + video_id.
 */
function generateVideoRowId(teamId: string, videoId: string): string {
  return createHash('sha256')
    .update(`${teamId}:${videoId}`)
    .digest('hex')
    .substring(0, 32);
}

/**
 * Upsert multiple team videos in a single operation.
 */
export async function upsertTeamVideos(inputs: TeamVideoInput[]): Promise<TeamVideo[]> {
  if (inputs.length === 0) {
    return [];
  }

  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const rows = inputs.map((input) => ({
    id: generateVideoRowId(input.teamId, input.videoId),
    team_id: input.teamId,
    video_id: input.videoId,
    title: input.title,
    link: input.link,
    thumbnail: input.thumbnail ?? null,
    published_at: input.publishedAt ?? null,
    channel_name: input.channelName ?? null,
    fetched_at: now,
    updated_at: now,
  }));

  const { data, error } = await supabase
    .from('team_videos')
    .upsert(rows, { onConflict: 'id' })
    .select();

  if (error) {
    throw new Error(`Failed to upsert team videos: ${error.message}`);
  }

  return (data ?? []).map(mapRowToTeamVideo);
}

/**
 * Delete videos for a team that were not refreshed in the latest fetch.
 * Keeps the DB in sync with what the RSS feed currently returns.
 */
export async function deleteStaleTeamVideos(
  teamId: string,
  currentVideoIds: string[]
): Promise<number> {
  if (currentVideoIds.length === 0) return 0;

  const supabase = getSupabaseClient();
  const keepIds = currentVideoIds.map((vid) => generateVideoRowId(teamId, vid));

  const { data, error } = await supabase
    .from('team_videos')
    .delete()
    .eq('team_id', teamId)
    .not('id', 'in', `(${keepIds.join(',')})`)
    .select('id');

  if (error) {
    throw new Error(`Failed to delete stale videos for ${teamId}: ${error.message}`);
  }

  return data?.length ?? 0;
}

/**
 * Delete all videos older than a specified number of days.
 */
export async function deleteOldTeamVideos(daysOld: number = 30): Promise<number> {
  const supabase = getSupabaseClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { data, error } = await supabase
    .from('team_videos')
    .delete()
    .lt('fetched_at', cutoffDate.toISOString())
    .select('id');

  if (error) {
    throw new Error(`Failed to delete old team videos: ${error.message}`);
  }

  return data?.length ?? 0;
}

function mapRowToTeamVideo(row: any): TeamVideo {
  return {
    id: row.id,
    teamId: row.team_id,
    videoId: row.video_id,
    title: row.title,
    link: row.link,
    thumbnail: row.thumbnail,
    publishedAt: row.published_at,
    channelName: row.channel_name,
    fetchedAt: new Date(row.fetched_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
