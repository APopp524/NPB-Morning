/**
 * Parser for extracting and normalizing standings from SerpApi responses.
 * Pure parsing + validation logic with no Supabase dependencies.
 */

import { SerpApiResponse, SerpApiStandingRow } from '../providers/serpapi/client';

export interface ParsedStanding {
  teamName: string;
  wins: number;
  losses: number;
  winPct: number | null;
  gamesBack: number;
  homeRecord?: string | null;
  awayRecord?: string | null;
  last10?: string | null;
  thumbnail?: string | null;
}

/**
 * Discriminated union for standings parsing results.
 * 'preseason' indicates that standings exist but contain no statistical data.
 * 'ok' indicates that standings contain full statistical data.
 */
export type StandingsResult =
  | { status: 'ok'; standings: ParsedStanding[] }
  | { status: 'preseason' };

/**
 * Parse standings from SerpApi response.
 * Validates that sports_results.league.standings exists and is non-empty.
 * Detects preseason state when standings exist but contain no statistical data.
 * Fails loudly on malformed data.
 */
export function parseStandingsFromResponse(
  response: SerpApiResponse,
  query: string,
  expectedLeague?: 'central' | 'pacific'
): StandingsResult {
  if (!response.sports_results) {
    const searchId = response.search_metadata?.id || 'unknown';
    const leagueMsg = expectedLeague ? `League: ${expectedLeague}. ` : '';
    throw new Error(
      `No sports_results found in SerpApi response. ` +
        `${leagueMsg}Query: "${query}". ` +
        `Search ID: ${searchId}. ` +
        `Note: SerpApi requires team-based queries (e.g., "Yomiuri Giants standings 2026") ` +
        `for reliable sports_results.`
    );
  }

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

  // Check if any row contains statistical data (w and l)
  // If none do, this is preseason - return early without parsing
  const hasStats = standings.some(
    (row: SerpApiStandingRow) =>
      row.w !== undefined && row.w !== null && row.l !== undefined && row.l !== null
  );

  if (!hasStats) {
    return { status: 'preseason' };
  }

  // Parse standings with full validation
  const parsedStandings = standings.map((row: SerpApiStandingRow) => {
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

    let winPct: number | null = null;
    if (row.pct) {
      const pct = parseFloat(row.pct);
      if (!isNaN(pct)) {
        winPct = pct;
      }
    }

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
      thumbnail: row.team.thumbnail || null,
    };
  });

  return { status: 'ok', standings: parsedStandings };
}

