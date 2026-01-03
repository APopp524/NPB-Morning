import { GameInput, ISODateString, StandingInput } from '../models';

export interface NPBDataProvider {
  fetchGames(date: ISODateString): Promise<GameInput[]>;
  fetchStandings(season: number, league: 'central' | 'pacific'): Promise<StandingInput[]>;
}

export interface SerpApiGameResponse {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status?: string;
}

export interface SerpApiStandingResponse {
  team: string;
  wins: number;
  losses: number;
  ties: number;
  gamesBack: number;
}

/**
 * Type matching the actual SerpApi sports_results.league.standings structure.
 */
export interface SerpApiStanding {
  team: {
    name: string;
    thumbnail?: string;
  };
  w: string; // wins as string
  l: string; // losses as string
  pct: string; // winning percentage as string (e.g., ".566")
  gb: string; // games back as string (e.g., "-" for leader, "3.5" for others)
  home: string; // home record (e.g., "39-30")
  away: string; // away record (e.g., "38-29")
  l10: string; // last 10 games record (e.g., "6-4")
}

