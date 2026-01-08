import { getSupabaseClient } from './supabase'
import type { Team } from '@/src/types/teams'

export interface GroupedTeams {
  central: Team[]
  pacific: Team[]
}

export async function getTeams(): Promise<GroupedTeams> {
  const supabase = getSupabaseClient()

  // Fetch all teams
  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select('id, name, name_en, league')
    .order('name_en', { ascending: true })

  if (teamsError) {
    throw new Error(`Failed to fetch teams: ${teamsError.message}`)
  }

  if (!teamsData || teamsData.length === 0) {
    throw new Error('No teams found in database')
  }

  // Transform to Team type
  const teams: Team[] = teamsData.map((team: any) => ({
    id: team.id,
    name: team.name,
    name_en: team.name_en,
    league: team.league,
  }))

  // Group by league
  const central = teams
    .filter((t) => t.league === 'central')
    .sort((a, b) => a.name_en.localeCompare(b.name_en))

  const pacific = teams
    .filter((t) => t.league === 'pacific')
    .sort((a, b) => a.name_en.localeCompare(b.name_en))

  // Log warning if league grouping doesn't equal 6 + 6
  if (central.length !== 6 || pacific.length !== 6) {
    console.warn(
      `Expected 6 teams per league, but found Central: ${central.length}, Pacific: ${pacific.length}`
    )
  }

  return {
    central,
    pacific,
  }
}

