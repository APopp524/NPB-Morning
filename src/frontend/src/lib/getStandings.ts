import { getSupabaseClient } from './supabase'
import type { StandingWithTeam } from '@/src/types/standingsWithTeam'

export interface GroupedStandings {
  season: number
  central: StandingWithTeam[]
  pacific: StandingWithTeam[]
  updated_at: string
}

export async function getStandings(): Promise<GroupedStandings> {
  const supabase = getSupabaseClient()

  // First, get the latest season
  const { data: latestSeasonData, error: seasonError } = await supabase
    .from('standings')
    .select('season')
    .order('season', { ascending: false })
    .limit(1)
    .single()

  if (seasonError || !latestSeasonData) {
    throw new Error('Failed to fetch latest season from standings')
  }

  const latestSeason = latestSeasonData.season

  // Fetch standings with team data for the latest season
  const { data: standingsData, error: standingsError } = await supabase
    .from('standings')
    .select(`
      id,
      season,
      wins,
      losses,
      ties,
      pct,
      games_back,
      league,
      team_id,
      updated_at,
      teams!inner (
        id,
        name,
        name_en,
        thumbnail_url
      )
    `)
    .eq('season', latestSeason)
    .order('wins', { ascending: false })
    .order('losses', { ascending: true })

  if (standingsError) {
    throw new Error(`Failed to fetch standings: ${standingsError.message}`)
  }

  if (!standingsData || standingsData.length === 0) {
    throw new Error(`No standings found for season ${latestSeason}`)
  }

  // Transform the data to StandingWithTeam format
  const standings: StandingWithTeam[] = standingsData
    .map((standing: any) => {
      // Handle the joined team data (Supabase returns it as an object for one-to-one relationships)
      const team = standing.teams

      if (!team) {
        return null
      }

      const teamData: StandingWithTeam['team'] = {
        id: team.id,
        name: team.name,
        name_en: team.name_en,
      }
      if (team.thumbnail_url != null) {
        teamData.thumbnail_url = team.thumbnail_url
      }

      const result: StandingWithTeam = {
        id: standing.id,
        season: standing.season,
        wins: standing.wins,
        losses: standing.losses,
        ties: standing.ties,
        pct: standing.pct,
        games_back: standing.games_back,
        league: standing.league || team.league,
        updated_at: standing.updated_at,
        team: teamData,
      }
      return result
    })
    .filter((standing): standing is StandingWithTeam => standing !== null)

  // Group by league first
  const central = standings.filter((s) => s.league === 'central')
  const pacific = standings.filter((s) => s.league === 'pacific')

  // Sort each league separately: wins desc, losses asc
  const sortStandings = (a: StandingWithTeam, b: StandingWithTeam) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins
    }
    return a.losses - b.losses
  }

  central.sort(sortStandings)
  pacific.sort(sortStandings)

  // Get the latest updated_at from the transformed standings
  // All standings should have similar updated_at, so we can use any one
  const latestUpdatedAt =
    standings.length > 0
      ? standings[0].updated_at
      : new Date().toISOString()

  return {
    season: latestSeason,
    central,
    pacific,
    updated_at: latestUpdatedAt,
  }
}

