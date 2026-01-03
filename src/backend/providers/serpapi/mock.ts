import { SerpApiGameResponse, SerpApiStandingResponse } from '../types';
import { GameInput, ISODateString, StandingInput } from '../../models';
import {
  generateTeamId,
  normalizeTeamNameToCanonical,
} from '../../utils/team-id';

/**
 * Normalize team name to canonical team ID.
 * Throws an error if the team name cannot be mapped to a canonical team.
 * This ensures all games and standings reference existing team IDs.
 */
function normalizeTeamName(teamName: string): string {
  // First normalize to canonical name (handles aliases)
  const canonicalName = normalizeTeamNameToCanonical(teamName);
  // Then generate ID using the same logic as the database
  const teamId = generateTeamId(canonicalName);

  // Validate that the team ID matches one of the 12 canonical NPB teams
  // This ensures we fail loudly if an unknown team is encountered
  const validTeamIds = new Set([
    'yomiuri-giants',
    'hanshin-tigers',
    'chunichi-dragons',
    'tokyo-yakult-swallows',
    'hiroshima-toyo-carp',
    'yokohama-dena-baystars',
    'fukuoka-softbank-hawks',
    'chiba-lotte-marines',
    'tohoku-rakuten-golden-eagles',
    'saitama-seibu-lions',
    'hokkaido-nippon-ham-fighters',
    'orix-buffaloes',
  ]);

  if (!validTeamIds.has(teamId)) {
    throw new Error(
      `Unknown team name "${teamName}" (normalized to "${canonicalName}", ID: "${teamId}"). ` +
        `Team must be one of the 12 canonical NPB teams seeded in the database.`
    );
  }

  return teamId;
}

/**
 * Normalize game status from provider response.
 * Returns 'unknown' for unrecognized statuses to fail loudly.
 */
function normalizeStatus(status?: string): GameInput['status'] {
  if (!status) return 'scheduled';

  const normalized = status.toLowerCase().trim();

  // Completed states
  if (
    normalized.includes('completed') ||
    normalized.includes('final') ||
    normalized === 'final'
  ) {
    return 'completed';
  }

  // In progress states
  if (
    normalized.includes('in progress') ||
    normalized.includes('live') ||
    normalized.includes('playing') ||
    normalized === 'live'
  ) {
    return 'in_progress';
  }

  // Postponed states
  if (
    normalized.includes('postponed') ||
    normalized.includes('delayed') ||
    normalized.includes('rain delay') ||
    normalized === 'postponed'
  ) {
    return 'postponed';
  }

  // Scheduled states
  if (
    normalized.includes('scheduled') ||
    normalized.includes('upcoming') ||
    normalized === 'scheduled' ||
    normalized === 'upcoming'
  ) {
    return 'scheduled';
  }

  // Suspended or cancelled states
  if (
    normalized.includes('suspended') ||
    normalized.includes('cancelled') ||
    normalized.includes('canceled')
  ) {
    return 'postponed'; // Map suspended/cancelled to postponed for now
  }

  // Unknown - fail loudly instead of silently misclassifying
  return 'unknown';
}

/**
 * Validate game responses before normalization.
 * Throws explicit errors for malformed data.
 */
function validateGames(games: SerpApiGameResponse[]): void {
  if (!Array.isArray(games)) {
    throw new Error('Games response must be an array');
  }

  games.forEach((game, index) => {
    if (!game.homeTeam || typeof game.homeTeam !== 'string') {
      throw new Error(
        `Game at index ${index} missing or invalid 'homeTeam' field`
      );
    }
    if (!game.awayTeam || typeof game.awayTeam !== 'string') {
      throw new Error(
        `Game at index ${index} missing or invalid 'awayTeam' field`
      );
    }
    // Scores can be null/undefined, but if present must be numbers
    if (
      game.homeScore !== null &&
      game.homeScore !== undefined &&
      typeof game.homeScore !== 'number'
    ) {
      throw new Error(
        `Game at index ${index} has invalid 'homeScore' (must be number or null)`
      );
    }
    if (
      game.awayScore !== null &&
      game.awayScore !== undefined &&
      typeof game.awayScore !== 'number'
    ) {
      throw new Error(
        `Game at index ${index} has invalid 'awayScore' (must be number or null)`
      );
    }
  });
}

/**
 * Validate standings responses before normalization.
 * Throws explicit errors for malformed data.
 */
function validateStandings(standings: SerpApiStandingResponse[]): void {
  if (!Array.isArray(standings)) {
    throw new Error('Standings response must be an array');
  }

  standings.forEach((standing, index) => {
    if (!standing.team || typeof standing.team !== 'string') {
      throw new Error(
        `Standing at index ${index} missing or invalid 'team' field`
      );
    }
    if (typeof standing.wins !== 'number' || standing.wins < 0) {
      throw new Error(
        `Standing at index ${index} missing or invalid 'wins' field`
      );
    }
    if (typeof standing.losses !== 'number' || standing.losses < 0) {
      throw new Error(
        `Standing at index ${index} missing or invalid 'losses' field`
      );
    }
    if (typeof standing.ties !== 'number' || standing.ties < 0) {
      throw new Error(
        `Standing at index ${index} missing or invalid 'ties' field`
      );
    }
    if (typeof standing.gamesBack !== 'number' || standing.gamesBack < 0) {
      throw new Error(
        `Standing at index ${index} missing or invalid 'gamesBack' field`
      );
    }
  });
}

/**
 * Normalize games from mock response format.
 */
function normalizeGames(
  games: SerpApiGameResponse[],
  date: ISODateString
): GameInput[] {
  validateGames(games);

  return games.map((game) => ({
    date, // Already in ISO format (YYYY-MM-DD)
    homeTeamId: normalizeTeamName(game.homeTeam),
    awayTeamId: normalizeTeamName(game.awayTeam),
    homeScore: game.homeScore ?? null,
    awayScore: game.awayScore ?? null,
    status: normalizeStatus(game.status),
  }));
}

/**
 * Normalize standings from mock response format.
 */
function normalizeStandings(
  standings: SerpApiStandingResponse[],
  season: number
): StandingInput[] {
  validateStandings(standings);

  return standings.map((standing) => ({
    teamId: normalizeTeamName(standing.team),
    season,
    wins: standing.wins,
    losses: standing.losses,
    ties: standing.ties,
    gamesBack: standing.gamesBack,
  }));
}

/**
 * Mock implementation for fetching games.
 */
export function mockFetchGames(date: ISODateString): GameInput[] {
  const mockResponse: SerpApiGameResponse[] = [
    {
      homeTeam: 'Yomiuri Giants',
      awayTeam: 'Hanshin Tigers',
      homeScore: 5,
      awayScore: 3,
      status: 'completed',
    },
    {
      homeTeam: 'Yomiuri Giants',
      awayTeam: 'Chunichi Dragons',
      homeScore: null,
      awayScore: null,
      status: 'scheduled',
    },
  ];

  return normalizeGames(mockResponse, date);
}

/**
 * Mock implementation for fetching standings.
 */
export function mockFetchStandings(season: number): StandingInput[] {
  const mockResponse: SerpApiStandingResponse[] = [
    {
      team: 'Yomiuri Giants',
      wins: 85,
      losses: 55,
      ties: 4,
      gamesBack: 0,
    },
    {
      team: 'Hanshin Tigers',
      wins: 82,
      losses: 58,
      ties: 4,
      gamesBack: 3,
    },
  ];

  return normalizeStandings(mockResponse, season);
}

