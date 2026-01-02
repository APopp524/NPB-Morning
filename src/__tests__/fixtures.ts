import { GameInput, StandingInput, TeamInput } from '../backend/models';

export const mockTeams: TeamInput[] = [
  {
    name: '読売ジャイアンツ',
    nameEn: 'Yomiuri Giants',
    league: 'central',
  },
  {
    name: '阪神タイガース',
    nameEn: 'Hanshin Tigers',
    league: 'central',
  },
];

export const mockGames: GameInput[] = [
  {
    date: '2024-01-15',
    homeTeamId: 'yomiuri-giants',
    awayTeamId: 'hanshin-tigers',
    homeScore: 5,
    awayScore: 3,
    status: 'completed',
  },
  {
    date: '2024-01-15',
    homeTeamId: 'yomiuri-giants',
    awayTeamId: 'hanshin-tigers',
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
  },
];

export const mockStandings: StandingInput[] = [
  {
    teamId: 'yomiuri-giants',
    season: 2024,
    wins: 85,
    losses: 55,
    ties: 4,
    gamesBack: 0,
  },
  {
    teamId: 'hanshin-tigers',
    season: 2024,
    wins: 82,
    losses: 58,
    ties: 4,
    gamesBack: 3,
  },
];

