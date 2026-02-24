import { getSupabaseClient } from './supabase'
import { getTeamLogoUrl } from './teamLogos'
import type { Team } from '@/src/types/teams'

export interface GroupedTeams {
  central: Team[]
  pacific: Team[]
}

export async function getTeams(): Promise<GroupedTeams> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('teams')
    .select('id, name, name_en, league')
    .order('name_en', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch teams: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error('No teams found in database')
  }

  // Single-pass grouping (already sorted by DB)
  const central: Team[] = []
  const pacific: Team[] = []

  for (const t of data) {
    const team: Team = {
      id: t.id,
      name: t.name,
      name_en: t.name_en,
      league: t.league,
      thumbnail_url: getTeamLogoUrl(t.id),
    }
    if (t.league === 'central') central.push(team)
    else pacific.push(team)
  }

  return { central, pacific }
}

