import { getSupabaseClient } from './supabase'
import { getTeamLogoUrl } from './teamLogos'

export interface GamesResponse {
  status: 'LIVE' | 'SCHEDULED' | 'NO_GAMES';
  sourceQuery: 'npb games' | 'npb schedule' | null;
  games: Array<{
    game_date: string;
    game_time: string | null;
    home_team: {
      name_en: string;
      thumbnail_url: string | null;
    };
    away_team: {
      name_en: string;
      thumbnail_url: string | null;
    };
    home_score: number | null;
    away_score: number | null;
    venue_name: string | null;
  }>;
}

// NPB has 12 teams = max 6 games/day; fetch enough to cover today + a few upcoming days
const MAX_GAMES = 12

function formatGameDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export async function getGames(): Promise<GamesResponse> {
  const supabase = getSupabaseClient()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Single query: get games from today onward, ordered by date.
  // We split today vs. upcoming in code, avoiding a second round trip.
  const { data, error } = await supabase
    .from('games')
    .select(`
      date, start_time, status, home_score, away_score,
      home_teams:home_team_id!inner ( id, name_en ),
      away_teams:away_team_id!inner ( id, name_en )
    `)
    .gte('date', todayStr)
    .order('date', { ascending: true })
    .limit(MAX_GAMES)

  if (error) {
    console.error('Failed to fetch games:', error)
    return { status: 'NO_GAMES', sourceQuery: null, games: [] }
  }

  if (!data || data.length === 0) {
    return { status: 'NO_GAMES', sourceQuery: null, games: [] }
  }

  // Prefer today's games; fall back to the full upcoming set
  const todayGames = data.filter((g: any) => g.date === todayStr)
  const source = todayGames.length > 0 ? todayGames : data

  const hasLive = source.some((g: any) => g.status === 'in_progress')

  const games = (source as any[]).map((g) => ({
    game_date: formatGameDate(g.date),
    game_time: g.start_time || null,
    home_team: {
      name_en: g.home_teams?.name_en || 'Unknown',
      thumbnail_url: getTeamLogoUrl(g.home_teams?.id),
    },
    away_team: {
      name_en: g.away_teams?.name_en || 'Unknown',
      thumbnail_url: getTeamLogoUrl(g.away_teams?.id),
    },
    home_score: g.home_score ?? null,
    away_score: g.away_score ?? null,
    venue_name: null,
  }))

  return {
    status: hasLive ? 'LIVE' : 'SCHEDULED',
    sourceQuery: null,
    games,
  }
}
