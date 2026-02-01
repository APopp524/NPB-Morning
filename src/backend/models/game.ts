export interface Game {
  id: string;
  date: Date;
  startTime: string | null;
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
  startTime: string | null; // e.g., "5:00 AM" in EST
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'unknown';
}

