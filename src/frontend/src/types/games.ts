export interface Game {
  id: string
  home_team_id: string
  away_team_id: string
  start_time: string | null
  status: 'scheduled' | 'live' | 'final'
  home_score?: number
  away_score?: number
}
