export interface Game {
  id: string
  home_team_id: string
  away_team_id: string
  scheduled_start_time: string
  status: 'scheduled' | 'live' | 'final'
  home_score?: number
  away_score?: number
}
