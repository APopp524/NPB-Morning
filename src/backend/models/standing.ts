export interface Standing {
  id: string;
  teamId: string;
  season: number;
  wins: number;
  losses: number;
  ties: number;
  gamesBack: number;
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
}

