/**
 * Team Videos Cron Runner (Node.js)
 *
 * Idempotent cron job that fetches the most recent YouTube uploads from each
 * NPB team's official channel via RSS feed and persists them to team_videos.
 *
 * How to run:
 *   npm run videos:run
 *   tsx src/scripts/run-videos.ts
 *
 * Environment Variables:
 *   - SUPABASE_URL: Required.
 *   - SUPABASE_SERVICE_ROLE_KEY: Preferred. Falls back to SUPABASE_ANON_KEY.
 *   - SUPABASE_ANON_KEY: Fallback.
 *
 * Exit Codes:
 *   - 0: Success
 *   - 1: Failure
 */

import 'dotenv/config';

import { fetchChannelVideosRSS } from '../backend/providers/youtube-rss';
import { upsertTeamVideos, deleteStaleTeamVideos, deleteOldTeamVideos } from '../backend/db/team-videos';
import { getSupabaseClient } from '../backend/db/client';
import type { TeamVideoInput } from '../backend/models/team-video';

function validateEnvironment(): void {
  if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL environment variable is required');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable is required'
    );
  }
}

function log(level: 'info' | 'error', message: string): void {
  const prefix = '[videos][cron]';
  const timestamp = new Date().toISOString();
  if (level === 'error') {
    console.error(`${prefix}[ERROR] ${timestamp} ${message}`);
  } else {
    console.log(`${prefix} ${timestamp} ${message}`);
  }
}

interface TeamRow {
  id: string;
  name_en: string;
  youtube_channel_id: string | null;
}

async function getAllTeams(): Promise<TeamRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('teams')
    .select('id, name_en, youtube_channel_id')
    .order('name_en');

  if (error) {
    throw new Error(`Failed to fetch teams: ${error.message}`);
  }
  return data ?? [];
}

async function fetchAndStoreForTeam(team: TeamRow): Promise<number> {
  if (!team.youtube_channel_id) {
    log('info', `  ${team.name_en}: no youtube_channel_id, skipping`);
    return 0;
  }

  const results = await fetchChannelVideosRSS(team.youtube_channel_id, 6);

  if (results.length === 0) {
    log('info', `  ${team.name_en}: no videos in RSS feed`);
    return 0;
  }

  const inputs: TeamVideoInput[] = results.map((v) => ({
    teamId: team.id,
    videoId: v.videoId,
    title: v.title,
    link: v.link,
    thumbnail: v.thumbnail,
    publishedAt: v.publishedAt,
    channelName: v.channelName,
  }));

  const rows = await upsertTeamVideos(inputs);

  const videoIds = results.map((v) => v.videoId);
  const staleCount = await deleteStaleTeamVideos(team.id, videoIds);

  log(
    'info',
    `  ${team.name_en}: ${rows.length} upserted, ${staleCount} stale removed`
  );

  return rows.length;
}

async function runVideosFetch(): Promise<void> {
  log('info', 'Starting team videos fetch from YouTube RSS feeds');

  validateEnvironment();

  const teams = await getAllTeams();
  log('info', `Found ${teams.length} teams`);

  let totalUpserted = 0;

  for (const team of teams) {
    try {
      const count = await fetchAndStoreForTeam(team);
      totalUpserted += count;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log('error', `Failed for ${team.name_en}: ${msg}`);
    }
  }

  log('info', `Upserted ${totalUpserted} videos across ${teams.length} teams`);

  log('info', 'Cleaning up old videos...');
  const deletedCount = await deleteOldTeamVideos(30);
  if (deletedCount > 0) {
    log('info', `Deleted ${deletedCount} old video(s)`);
  }

  log('info', 'Success');
}

async function main(): Promise<void> {
  try {
    await runVideosFetch();
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log('error', errorMessage);
    process.exit(1);
  }
}

main();
