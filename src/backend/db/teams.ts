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
  };
}

export async function upsertTeams(inputs: TeamInput[]): Promise<Team[]> {
  return Promise.all(inputs.map((input) => upsertTeam(input)));
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

