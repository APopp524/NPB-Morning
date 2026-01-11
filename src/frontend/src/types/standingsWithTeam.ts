export interface StandingWithTeam {
  id: string
  season: number
  wins: number
  losses: number
  ties: number
  pct: number | null
  games_back: number | null
  league: 'central' | 'pacific'
  team: {
    id: string
    name: string
    name_en: string
    thumbnail_url?: string | null
  }
}

