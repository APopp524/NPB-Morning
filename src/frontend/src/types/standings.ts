export interface Standing {
  id: string
  team_id: string
  season: number
  wins: number
  losses: number
  ties: number
  games_back: number
  pct: number | null
  league: 'central' | 'pacific'
  updated_at: string
}

