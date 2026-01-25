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
        pct: input.pct ?? null,
        home_record: input.homeRecord ?? null,
        away_record: input.awayRecord ?? null,
        last_10: input.last10 ?? null,
        league: input.league ?? null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'team_id,season',
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
    pct: data.pct ?? null,
    homeRecord: data.home_record ?? null,
    awayRecord: data.away_record ?? null,
    last10: data.last_10 ?? null,
    league: data.league ?? null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Upsert multiple standings in a single transaction.
 * Uses a single upsert call to ensure atomicity.
 */
export async function upsertStandings(
  inputs: StandingInput[]
): Promise<Standing[]> {
  if (inputs.length === 0) {
    return [];
  }

  const supabase = getSupabaseClient();

  // Prepare all rows for upsert
  const rows = inputs.map((input) => ({
    id: `${input.season}-${input.teamId}`,
    team_id: input.teamId,
    season: input.season,
    wins: input.wins,
    losses: input.losses,
    ties: input.ties,
    games_back: input.gamesBack,
    pct: input.pct ?? null,
    home_record: input.homeRecord ?? null,
    away_record: input.awayRecord ?? null,
    last_10: input.last10 ?? null,
    league: input.league ?? null,
    updated_at: new Date().toISOString(),
  }));

  // Upsert all rows in a single call (atomic operation)
  // Uses UNIQUE(team_id, season) constraint for idempotent writes
  const { data, error } = await supabase
    .from('standings')
    .upsert(rows, {
      onConflict: 'team_id,season',
    })
    .select();

  if (error) {
    throw new Error(`Failed to upsert standings: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    teamId: row.team_id,
    season: row.season,
    wins: row.wins,
    losses: row.losses,
    ties: row.ties,
    gamesBack: row.games_back,
    pct: row.pct ?? null,
    homeRecord: row.home_record ?? null,
    awayRecord: row.away_record ?? null,
    last10: row.last_10 ?? null,
    league: row.league ?? null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}

/**
 * Preseason keepalive: Update updated_at timestamp for all standings rows for a given season.
 * This prevents Supabase project pause due to inactivity during preseason.
 * 
 * This function:
 * - Updates updated_at on all existing standings rows for the season
 * - Does NOT modify wins/losses/etc (only touches updated_at)
 * - Is idempotent and safe to run multiple times
 * - Returns the number of rows updated
 * 
 * @param season The season year to update standings for
 * @returns The number of rows updated
 */
export async function keepaliveStandings(season: number): Promise<number> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('standings')
    .update({ updated_at: new Date().toISOString() })
    .eq('season', season)
    .select('id');

  if (error) {
    throw new Error(`Failed to update standings keepalive: ${error.message}`);
  }

  return data?.length ?? 0;
}
