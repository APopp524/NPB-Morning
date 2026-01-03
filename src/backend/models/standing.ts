export interface Standing {
  id: string;
  teamId: string;
  season: number;
  wins: number;
  losses: number;
  ties: number;
  gamesBack: number;
  pct?: number | null;
  homeRecord?: string | null;
  awayRecord?: string | null;
  last10?: string | null;
  league?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StandingInput {
  teamId: string;
  season: number;
  wins: number;
  losses: number;
  ties: number;
  gamesBack: number;
  pct?: number | null;
  homeRecord?: string | null;
  awayRecord?: string | null;
  last10?: string | null;
  league?: string | null;
}

