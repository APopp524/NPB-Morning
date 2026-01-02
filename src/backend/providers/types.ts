import { GameInput, ISODateString, StandingInput, TeamInput } from '../models';

export interface NPBDataProvider {
  fetchGames(date: ISODateString): Promise<GameInput[]>;
  fetchStandings(season: number): Promise<StandingInput[]>;
  fetchTeams(): Promise<TeamInput[]>;
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

export interface SerpApiTeamResponse {
  name: string;
  nameEn: string;
  league: 'central' | 'pacific';
}

