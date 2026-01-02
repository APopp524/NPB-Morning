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

