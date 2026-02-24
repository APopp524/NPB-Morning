import { getSupabaseClient } from './supabase'
import { getTeamLogoUrl } from './teamLogos'
import type { StandingWithTeam } from '@/src/types/standingsWithTeam'

export interface GroupedStandings {
  season: number
  central: StandingWithTeam[]
  pacific: StandingWithTeam[]
  updated_at: string
}

const TEAMS_PER_LEAGUE = 6
const TOTAL_TEAMS = TEAMS_PER_LEAGUE * 2

export async function getStandings(): Promise<GroupedStandings> {
  const supabase = getSupabaseClient()

  // Single query: order by season DESC to get the latest season's 12 rows,
  // then by wins DESC / losses ASC for ranking order within that season.
  const { data, error } = await supabase
    .from('standings')
    .select(`
      id, season, wins, losses, ties, pct, games_back, league, team_id, updated_at,
      teams!inner ( id, name, name_en )
    `)
    .order('season', { ascending: false })
    .order('wins', { ascending: false })
    .order('losses', { ascending: true })
    .limit(TOTAL_TEAMS)

  if (error) {
    throw new Error(`Failed to fetch standings: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error('No standings found')
  }

  const latestSeason = (data[0] as any).season

  const sortStandings = (a: StandingWithTeam, b: StandingWithTeam) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    return a.losses - b.losses
  }

  const central: StandingWithTeam[] = []
  const pacific: StandingWithTeam[] = []

  for (const row of data as any[]) {
    if (row.season !== latestSeason || !row.teams) continue

    const standing: StandingWithTeam = {
      id: row.id,
      season: row.season,
      wins: row.wins,
      losses: row.losses,
      ties: row.ties,
      pct: row.pct,
      games_back: row.games_back,
      league: row.league,
      updated_at: row.updated_at,
      team: {
        id: row.teams.id,
        name: row.teams.name,
        name_en: row.teams.name_en,
        thumbnail_url: getTeamLogoUrl(row.teams.id),
      },
    }

    if (standing.league === 'central') central.push(standing)
    else pacific.push(standing)
  }

  central.sort(sortStandings)
  pacific.sort(sortStandings)

  return {
    season: latestSeason,
    central,
    pacific,
    updated_at: data[0].updated_at ?? new Date().toISOString(),
  }
}

