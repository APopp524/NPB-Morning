/**
 * Fetch NPB games from the database.
 * Returns normalized games data with status (LIVE, SCHEDULED, or NO_GAMES).
 * First tries to find today's games, then falls back to next upcoming games if none found.
 * Follows the same pattern as getStandings() - reads directly from Supabase.
 */

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

/**
 * Get games from the database.
 * First tries to find today's games, then falls back to next upcoming games if none found.
 */
export async function getGames(): Promise<GamesResponse> {
  const supabase = getSupabaseClient()

  // Get today's date in YYYY-MM-DD format
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${day}`

  // First, try to fetch games for today
  const { data: todayGamesData, error: todayGamesError } = await supabase
    .from('games')
    .select(`
      id,
      date,
      start_time,
      status,
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      home_teams:home_team_id!inner (
        id,
        name_en
      ),
      away_teams:away_team_id!inner (
        id,
        name_en
      )
    `)
    .eq('date', todayStr)
    .order('date', { ascending: true })

  if (todayGamesError) {
    console.error('Failed to fetch today\'s games:', todayGamesError)
  }

  // If we found games for today, use them
  if (todayGamesData && todayGamesData.length > 0) {
    // Determine status based on game statuses
    // If any game is in_progress, return LIVE
    // Otherwise, if all are scheduled, return SCHEDULED
    const hasLiveGames = todayGamesData.some((game: any) => game.status === 'in_progress')
    const status: 'LIVE' | 'SCHEDULED' = hasLiveGames ? 'LIVE' : 'SCHEDULED'

    // Transform games to the expected format
    const games = todayGamesData.map((game: any) => {
      const homeTeam = game.home_teams
      const awayTeam = game.away_teams

      // Format date from ISO string (date is stored as DATE type: "2026-03-27")
      const gameDate = new Date(game.date)
      const gameDateStr = gameDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

      return {
        game_date: gameDateStr,
        game_time: game.start_time || null,
        home_team: {
          name_en: homeTeam?.name_en || 'Unknown',
          thumbnail_url: getTeamLogoUrl(homeTeam?.id),
        },
        away_team: {
          name_en: awayTeam?.name_en || 'Unknown',
          thumbnail_url: getTeamLogoUrl(awayTeam?.id),
        },
        home_score: game.home_score ?? null,
        away_score: game.away_score ?? null,
        venue_name: null,
      }
    })

    return {
      status,
      sourceQuery: null,
      games,
    }
  }

  // No games found for today, try to find next upcoming games
  const { data: upcomingGamesData, error: upcomingGamesError } = await supabase
    .from('games')
    .select(`
      id,
      date,
      start_time,
      status,
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      home_teams:home_team_id!inner (
        id,
        name_en
      ),
      away_teams:away_team_id!inner (
        id,
        name_en
      )
    `)
    .gte('date', todayStr)
    .in('status', ['scheduled', 'in_progress'])
    .order('date', { ascending: true })
    .limit(10) // Limit to next 10 upcoming games

  if (upcomingGamesError) {
    console.error('Failed to fetch upcoming games:', upcomingGamesError)
    return {
      status: 'NO_GAMES',
      sourceQuery: null,
      games: [],
    }
  }

  if (!upcomingGamesData || upcomingGamesData.length === 0) {
    return {
      status: 'NO_GAMES',
      sourceQuery: null,
      games: [],
    }
  }

  // Transform upcoming games to the expected format
  const games = upcomingGamesData.map((game: any) => {
    const homeTeam = game.home_teams
    const awayTeam = game.away_teams

    // Format date from ISO string (date is stored as DATE type: "2026-03-27")
    const gameDate = new Date(game.date)
    const gameDateStr = gameDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    return {
      game_date: gameDateStr,
      game_time: game.start_time || null,
      home_team: {
        name_en: homeTeam?.name_en || 'Unknown',
        thumbnail_url: getTeamLogoUrl(homeTeam?.id),
      },
      away_team: {
        name_en: awayTeam?.name_en || 'Unknown',
        thumbnail_url: getTeamLogoUrl(awayTeam?.id),
      },
      home_score: game.home_score ?? null,
      away_score: game.away_score ?? null,
      venue_name: null,
    }
  })

  // Upcoming games are always SCHEDULED (or in_progress if they've started)
  const hasLiveGames = upcomingGamesData.some((game: any) => game.status === 'in_progress')
  const status: 'LIVE' | 'SCHEDULED' = hasLiveGames ? 'LIVE' : 'SCHEDULED'

  return {
    status,
    sourceQuery: null,
    games,
  }
}
