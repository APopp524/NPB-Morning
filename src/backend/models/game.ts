export interface Game {
  id: string;
  date: Date;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'unknown';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ISO date string in YYYY-MM-DD format.
 * Used for date boundaries to avoid timezone issues.
 */
export type ISODateString = string;

export interface GameInput {
  date: ISODateString; // YYYY-MM-DD format
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'unknown';
}

