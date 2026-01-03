/**
 * Parser for extracting and normalizing standings from SerpApi responses.
 */

import { SerpApiResponse, SerpApiStandingRow } from './client';

const TEAM_QUERY_NOTE = 
  `Note: SerpApi requires team-based queries (e.g., "Yomiuri Giants standings 2026") ` +
  `rather than league-only queries for reliable sports_results.`;

export interface ParsedStanding {
  teamName: string;
  wins: number;
  losses: number;
  winPct: number | null;
  gamesBack: number;
  homeRecord?: string | null;
  awayRecord?: string | null;
  last10?: string | null;
}

/**
 * Parse standings from SerpApi response.
 * Validates that sports_results.league.standings exists and is non-empty.
 */
export function parseStandingsFromResponse(
  response: SerpApiResponse,
  query: string,
  expectedLeague?: 'central' | 'pacific'
): ParsedStanding[] {
  // Validate sports_results exists
  if (!response.sports_results) {
    const searchId = response.search_metadata?.id || 'unknown';
    const leagueMsg = expectedLeague ? `League: ${expectedLeague}. ` : '';
    throw new Error(
      `No sports_results found in SerpApi response. ` +
        `${leagueMsg}Query: "${query}". ` +
        `Search ID: ${searchId}. ` +
        `This usually means the query did not return sports data. ${TEAM_QUERY_NOTE}`
    );
  }

  // Validate league.standings exists
  if (!response.sports_results.league) {
    const searchId = response.search_metadata?.id || 'unknown';
    const leagueMsg = expectedLeague ? `League: ${expectedLeague}. ` : '';
    throw new Error(
      `No league data found in SerpApi response. ` +
        `${leagueMsg}Query: "${query}". ` +
        `Search ID: ${searchId}.`
    );
  }

  const standings = response.sports_results.league.standings;

  if (!standings || !Array.isArray(standings) || standings.length === 0) {
    const searchId = response.search_metadata?.id || 'unknown';
    const leagueMsg = expectedLeague ? `League: ${expectedLeague}. ` : '';
    throw new Error(
      `No standings array found in SerpApi response or array is empty. ` +
        `${leagueMsg}Query: "${query}". ` +
        `Search ID: ${searchId}.`
    );
  }

  // Parse each standing row
  return standings.map((row: SerpApiStandingRow) => {
    // Validate required fields
    if (!row.team || !row.team.name) {
      throw new Error(
        `Invalid standings row: missing team name. ` +
          `Query: "${query}". ` +
          `Row: ${JSON.stringify(row)}`
      );
    }

    if (row.w === undefined || row.w === null) {
      throw new Error(
        `Invalid standings row: missing wins (w). ` +
          `Query: "${query}". ` +
          `Team: ${row.team.name}`
      );
    }

    if (row.l === undefined || row.l === null) {
      throw new Error(
        `Invalid standings row: missing losses (l). ` +
          `Query: "${query}". ` +
          `Team: ${row.team.name}`
      );
    }

    if (row.gb === undefined || row.gb === null) {
      throw new Error(
        `Invalid standings row: missing games back (gb). ` +
          `Query: "${query}". ` +
          `Team: ${row.team.name}`
      );
    }

    // Parse numeric values
    const wins = parseInt(row.w, 10);
    if (isNaN(wins)) {
      throw new Error(
        `Invalid wins value: "${row.w}". ` +
          `Query: "${query}". ` +
          `Team: ${row.team.name}`
      );
    }

    const losses = parseInt(row.l, 10);
    if (isNaN(losses)) {
      throw new Error(
        `Invalid losses value: "${row.l}". ` +
          `Query: "${query}". ` +
          `Team: ${row.team.name}`
      );
    }

    // Parse win percentage (optional)
    let winPct: number | null = null;
    if (row.pct) {
      const pct = parseFloat(row.pct);
      if (!isNaN(pct)) {
        winPct = pct;
      }
    }

    // Parse games back
    // "-" means the team is in first place (0 games back)
    let gamesBack: number;
    if (row.gb === '-' || row.gb === '—' || row.gb.trim() === '') {
      gamesBack = 0;
    } else {
      const gb = parseFloat(row.gb);
      if (isNaN(gb)) {
        throw new Error(
          `Invalid games back value: "${row.gb}". ` +
            `Query: "${query}". ` +
            `Team: ${row.team.name}`
        );
      }
      gamesBack = gb;
    }

    return {
      teamName: row.team.name,
      wins,
      losses,
      winPct,
      gamesBack,
      homeRecord: row.home || null,
      awayRecord: row.away || null,
      last10: row.l10 || null,
    };
  });
}
