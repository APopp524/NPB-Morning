import { getSupabaseClient } from './client';
import { Standing, StandingInput } from '../models/standing';

export async function upsertStanding(input: StandingInput): Promise<Standing> {
  const supabase = getSupabaseClient();

  // Create idempotent ID based on team and season
  const id = `${input.season}-${input.teamId}`;

  const { data, error } = await supabase
    .from('standings')
    .upsert(
      {
        id,
        team_id: input.teamId,
        season: input.season,
        wins: input.wins,
        losses: input.losses,
        ties: input.ties,
        games_back: input.gamesBack,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert standing: ${error.message}`);
  }

  return {
    id: data.id,
    teamId: data.team_id,
    season: data.season,
    wins: data.wins,
    losses: data.losses,
    ties: data.ties,
    gamesBack: data.games_back,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function upsertStandings(
  inputs: StandingInput[]
): Promise<Standing[]> {
  return Promise.all(inputs.map((input) => upsertStanding(input)));
}

