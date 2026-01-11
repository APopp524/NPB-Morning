import { getSupabaseClient } from './client';
import { Team, TeamInput } from '../models/team';
import { generateTeamId } from '../utils/team-id';

export async function upsertTeam(input: TeamInput): Promise<Team> {
  const supabase = getSupabaseClient();

  // Use nameEn as the unique identifier for idempotency
  const id = generateTeamId(input.nameEn);

  const { data, error } = await supabase
    .from('teams')
    .upsert(
      {
        id,
        name: input.name,
        name_en: input.nameEn,
        league: input.league,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert team: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    nameEn: data.name_en,
    league: data.league,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    thumbnailUrl: data.thumbnail_url || null,
    thumbnailSource: data.thumbnail_source || null,
    thumbnailUpdatedAt: data.thumbnail_updated_at ? new Date(data.thumbnail_updated_at) : null,
  };
}

export async function upsertTeams(inputs: TeamInput[]): Promise<Team[]> {
  return Promise.all(inputs.map((input) => upsertTeam(input)));
}

/**
 * Update team thumbnail if needed.
 * This is a non-blocking operation that never throws errors.
 * 
 * Rules:
 * - Only updates if thumbnail_url is NULL or different from new URL
 * - Wrapped in try/catch to never fail the standings cron
 * - Logs warnings on failure with team name, season, and league context
 * 
 * @param teamId The team ID to update
 * @param thumbnailUrl The new thumbnail URL (optional)
 * @param context Context for logging (team name, season, league)
 * @param logger Optional logger function (defaults to console.warn)
 */
export async function maybeUpdateTeamThumbnail(
  teamId: string,
  thumbnailUrl: string | null | undefined,
  context: { teamName: string; season: number; league?: string },
  logger: (message: string) => void = console.warn
): Promise<void> {
  // Early return if no thumbnail provided
  if (!thumbnailUrl || typeof thumbnailUrl !== 'string' || thumbnailUrl.trim() === '') {
    return;
  }

  try {
    const supabase = getSupabaseClient();

    // First, get the current team record to check if update is needed
    const { data: currentTeam, error: fetchError } = await supabase
      .from('teams')
      .select('thumbnail_url')
      .eq('id', teamId)
      .single();

    if (fetchError) {
      logger(
        `Failed to fetch team for thumbnail update: Team ID "${teamId}", ` +
          `Team: "${context.teamName}", Season: ${context.season}, ` +
          `League: ${context.league || 'unknown'}. Error: ${fetchError.message}`
      );
      return;
    }

    // Only update if thumbnail_url is NULL or different
    if (currentTeam && currentTeam.thumbnail_url === thumbnailUrl) {
      return; // No update needed
    }

    // Update the thumbnail
    const { error: updateError } = await supabase
      .from('teams')
      .update({
        thumbnail_url: thumbnailUrl,
        thumbnail_source: 'serpapi',
        thumbnail_updated_at: new Date().toISOString(),
      })
      .eq('id', teamId);

    if (updateError) {
      logger(
        `Failed to update team thumbnail: Team ID "${teamId}", ` +
          `Team: "${context.teamName}", Season: ${context.season}, ` +
          `League: ${context.league || 'unknown'}. Error: ${updateError.message}`
      );
    }
  } catch (error) {
    // Catch any unexpected errors and log them
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger(
      `Unexpected error updating team thumbnail: Team ID "${teamId}", ` +
        `Team: "${context.teamName}", Season: ${context.season}, ` +
        `League: ${context.league || 'unknown'}. Error: ${errorMessage}`
    );
  }
}

/**
 * Get all teams from the database.
 */
export async function getTeams(): Promise<Team[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('id');

  if (error) {
    throw new Error(`Failed to get teams: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    league: row.league,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    thumbnailUrl: row.thumbnail_url || null,
    thumbnailSource: row.thumbnail_source || null,
    thumbnailUpdatedAt: row.thumbnail_updated_at ? new Date(row.thumbnail_updated_at) : null,
  }));
}

/**
 * Get the first team from the database (ordered by id).
 * Used as a default seed team for standings queries.
 */
export async function getFirstTeam(): Promise<Team | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('id')
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get first team: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    nameEn: data.name_en,
    league: data.league,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    thumbnailUrl: data.thumbnail_url || null,
    thumbnailSource: data.thumbnail_source || null,
    thumbnailUpdatedAt: data.thumbnail_updated_at ? new Date(data.thumbnail_updated_at) : null,
  };
}

/**
 * Count the number of teams in the database.
 * Used for validation (e.g., ensuring teams exist before cron runs).
 */
export async function countTeams(): Promise<number> {
  const supabase = getSupabaseClient();

  const { count, error } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(`Failed to count teams: ${error.message}`);
  }

  return count ?? 0;
}

