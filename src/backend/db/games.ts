import { getSupabaseClient } from './client';
import { Game, GameInput } from '../models/game';

export async function upsertGame(input: GameInput): Promise<Game> {
  const supabase = getSupabaseClient();

  // Create idempotent ID based on date (already ISO string) and teams
  const id = `${input.date}-${input.homeTeamId}-${input.awayTeamId}`;

  // Convert ISO date string (YYYY-MM-DD) to full ISO timestamp for database
  const dateISO = `${input.date}T00:00:00.000Z`;

  const { data, error } = await supabase
    .from('games')
    .upsert(
      {
        id,
        date: dateISO,
        home_team_id: input.homeTeamId,
        away_team_id: input.awayTeamId,
        home_score: input.homeScore,
        away_score: input.awayScore,
        status: input.status,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert game: ${error.message}`);
  }

  return {
    id: data.id,
    date: new Date(data.date),
    homeTeamId: data.home_team_id,
    awayTeamId: data.away_team_id,
    homeScore: data.home_score,
    awayScore: data.away_score,
    status: data.status,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function upsertGames(inputs: GameInput[]): Promise<Game[]> {
  return Promise.all(inputs.map((input) => upsertGame(input)));
}

