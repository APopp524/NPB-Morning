/**
 * Parser for extracting and normalizing games from SerpApi responses.
 * Defensively handles missing fields and gracefully returns empty arrays when no games are found.
 */

import { SerpApiResponse, SerpApiGameRow } from './client';

export interface ParsedGame {
  game_date: string;
  game_time: string | null;
  home_team_name: string;
  away_team_name: string;
  venue_name: string | null;
}

/**
 * Parse games from SerpApi response.
 * Returns empty array if no games are found (defensive parsing).
 * Handles missing fields gracefully.
 */
export function parseGamesFromResponse(
  response: SerpApiResponse,
  query: string
): ParsedGame[] {
  // If no sports_results, return empty array
  if (!response.sports_results) {
    return [];
  }

  // If no games array, return empty array
  const games = response.sports_results.games;
  if (!games || !Array.isArray(games) || games.length === 0) {
    return [];
  }

  // Parse each game row defensively
  return games
    .map((row: SerpApiGameRow, index: number) => {
      // Extract team names defensively - handle multiple formats
      let homeTeamName: string | null = null;
      let awayTeamName: string | null = null;

      // Format 1: teams array (e.g., [{"name":"Yomiuri"}, {"name":"Hanshin"}])
      // Typically first team is away, second is home
      if (row.teams && Array.isArray(row.teams) && row.teams.length >= 2) {
        awayTeamName = row.teams[0]?.name || null;
        homeTeamName = row.teams[1]?.name || null;
      }

      // Format 2: home_team and away_team objects
      if (!homeTeamName || !awayTeamName) {
        homeTeamName = homeTeamName || 
          row.home_team?.name ||
          (row as any).home_team_name ||
          (row as any).homeTeam ||
          null;
        awayTeamName = awayTeamName ||
          row.away_team?.name ||
          (row as any).away_team_name ||
          (row as any).awayTeam ||
          null;
      }

      // Skip games with missing team names
      if (!homeTeamName || !awayTeamName) {
        console.warn(
          `[Games Parser] Skipping game at index ${index}: missing team names. ` +
            `Query: "${query}". ` +
            `Row: ${JSON.stringify(row)}`
        );
        return null;
      }

      // Extract date defensively
      const gameDate =
        row.date ||
        (row as any).game_date ||
        (row as any).date_time?.split(' ')[0] ||
        '';

      // Extract time defensively
      const gameTime =
        row.time ||
        (row as any).game_time ||
        (row as any).date_time?.split(' ').slice(1).join(' ') ||
        null;

      // Extract venue defensively
      const venueName =
        row.venue ||
        (row as any).venue_name ||
        (row as any).stadium ||
        null;

      return {
        game_date: gameDate,
        game_time: gameTime,
        home_team_name: homeTeamName,
        away_team_name: awayTeamName,
        venue_name: venueName,
      };
    })
    .filter((game): game is ParsedGame => game !== null);
}
