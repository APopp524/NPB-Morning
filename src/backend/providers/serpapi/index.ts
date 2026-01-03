/**
 * SerpApi provider for fetching NPB data.
 * Uses team-anchored queries for reliable standings retrieval.
 */

import { SerpApiClient, SerpApiResponse } from './client';
import { parseStandingsFromResponse, ParsedStanding } from './standings.parser';
import { mapSerpApiTeamNameToDatabaseTeam, getLeagueForTeamId } from './team-map';
import { StandingInput } from '../../models/standing';
import { getTeams } from '../../db/teams';

export type SerpApiMode = 'live' | 'mock';

/**
 * Anchor teams used for team-anchored queries.
 * Team-anchored queries are more reliable than league-only queries,
 * as SerpApi league-only queries often fail to return sports_results.
 */
const ANCHOR_TEAM_BY_LEAGUE = {
  central: 'Yomiuri Giants',
  pacific: 'Fukuoka SoftBank Hawks',
} as const;

export class SerpApiProvider {
  private client: SerpApiClient | null;
  private mode: SerpApiMode;

  constructor(apiKey: string | undefined, mode: SerpApiMode = 'live') {
    if (mode === 'live' && !apiKey) {
      throw new Error('SerpApi API key is required for live mode');
    }
    this.mode = mode;
    this.client = apiKey ? new SerpApiClient(apiKey) : null;
  }

  /**
   * Fetch standings for a given season and league using team-anchored queries.
   * Team-anchored queries (e.g., "Yomiuri Giants standings 2026") are more reliable
   * than league-only queries, as SerpApi often fails to return sports_results for
   * league-only queries like "NPB Central League standings 2026".
   * 
   * @param season The season year (e.g., 2026)
   * @param league The league to fetch ('central' | 'pacific')
   * @returns Array of normalized StandingInput objects for the specified league
   */
  async fetchStandings(
    season: number,
    league: 'central' | 'pacific'
  ): Promise<StandingInput[]> {
    // Build team-anchored query
    const anchorTeam = ANCHOR_TEAM_BY_LEAGUE[league];
    const query = `${anchorTeam} standings ${season}`;
    console.log(`[SerpApi] Query: "${query}" (League: ${league})`);

    // Fetch from SerpApi
    if (!this.client) {
      throw new Error('SerpApi client not initialized');
    }

    let response: SerpApiResponse;
    try {
      response = await this.client.search(query);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to fetch from SerpApi. ` +
          `League: ${league}. ` +
          `Query: "${query}". ` +
          `Error: ${errorMessage}`
      );
    }

    // Validate and parse standings
    let parsedStandings: ParsedStanding[];
    try {
      parsedStandings = parseStandingsFromResponse(response, query, league);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const searchId = response.search_metadata?.id || 'unknown';
      throw new Error(
        `Failed to parse standings from SerpApi response. ` +
          `League: ${league}. ` +
          `Query: "${query}". ` +
          `Search ID: ${searchId}. ` +
          `Error: ${errorMessage}. ` +
          `Note: SerpApi requires team-based queries (e.g., "${anchorTeam} standings ${season}") ` +
          `for reliable sports_results.`
      );
    }

    console.log(
      `[SerpApi] Successfully parsed ${parsedStandings.length} standings rows for ${league} league`
    );

    // Get all teams from database for mapping
    const teams = await getTeams();
    if (teams.length === 0) {
      throw new Error(
        'No teams found in database. Teams must be seeded before mapping standings.'
      );
    }

    // Map SerpApi team names to database team IDs and normalize to StandingInput
    const standingInputs: StandingInput[] = [];
    const unmappedTeams: string[] = [];

    for (const parsed of parsedStandings) {
      const teamId = mapSerpApiTeamNameToDatabaseTeam(parsed.teamName, teams);

      if (!teamId) {
        unmappedTeams.push(parsed.teamName);
        console.warn(
          `[SerpApi] Warning: Could not map team name "${parsed.teamName}" to database team. Skipping.`
        );
        continue;
      }

      // Validate league integrity - team's league must match the expected league
      let teamLeague: 'central' | 'pacific';
      try {
        teamLeague = getLeagueForTeamId(teamId);
      } catch (error) {
        throw new Error(
          `Could not determine league for team ID "${teamId}". ` +
            `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      // Validate that the team belongs to the expected league
      if (teamLeague !== league) {
        throw new Error(
          `League mismatch: Team "${parsed.teamName}" (ID: ${teamId}) belongs to ${teamLeague} league, ` +
            `but was found in ${league} league standings. ` +
            `Query: "${query}".`
        );
      }

      standingInputs.push({
        teamId,
        season,
        wins: parsed.wins,
        losses: parsed.losses,
        ties: 0, // SerpApi doesn't provide ties, defaulting to 0
        gamesBack: parsed.gamesBack,
        pct: parsed.winPct,
        homeRecord: parsed.homeRecord,
        awayRecord: parsed.awayRecord,
        last10: parsed.last10,
        league,
      });
    }

    if (unmappedTeams.length > 0) {
      throw new Error(
        `${unmappedTeams.length} team(s) could not be mapped for ${league} league: ` +
          `${unmappedTeams.join(', ')}. ` +
          `Query: "${query}".`
      );
    }

    if (standingInputs.length === 0) {
      throw new Error(
        `No standings could be mapped to database teams for ${league} league. ` +
          `Query: "${query}". ` +
          `This may indicate a problem with team name mapping.`
      );
    }

    console.log(
      `[SerpApi] Successfully mapped ${standingInputs.length} standings to database teams for ${league} league`
    );

    return standingInputs;
  }

  /**
   * Fetch standings for both leagues and merge the results.
   * Validates that each league returns exactly 6 teams and that there are no duplicates.
   * 
   * @param season The season year (e.g., 2026)
   * @returns Array of normalized StandingInput objects for both leagues (12 teams total)
   */
  async fetchStandingsForBothLeagues(season: number): Promise<StandingInput[]> {
    console.log(`[SerpApi] Fetching standings for both leagues (season ${season})...`);

    // Fetch both leagues independently
    const [central, pacific] = await Promise.all([
      this.fetchStandings(season, 'central'),
      this.fetchStandings(season, 'pacific'),
    ]);

    // Validate each league has exactly 6 teams
    const validateLeagueCount = (league: 'central' | 'pacific', count: number) => {
      if (count !== 6) {
        const issue = count < 6 ? 'incomplete' : 'duplicate or invalid';
        throw new Error(
          `${league === 'central' ? 'Central' : 'Pacific'} League returned ${count} teams. ` +
            `Expected exactly 6 teams. This may indicate ${issue} data from SerpApi.`
        );
      }
    };

    validateLeagueCount('central', central.length);
    validateLeagueCount('pacific', pacific.length);

    // Merge results and check for duplicates
    const allStandings = [...central, ...pacific];
    const seen = new Set<string>();
    const duplicates: string[] = [];
    
    for (const standing of allStandings) {
      const key = `${standing.season}-${standing.teamId}`;
      if (seen.has(key)) {
        duplicates.push(key);
      }
      seen.add(key);
    }

    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate teamId + season entries detected: ${duplicates.join(', ')}. ` +
          `Each team should appear exactly once per season.`
      );
    }

    console.log(
      `[SerpApi] Successfully fetched standings for both leagues: ` +
        `${central.length} Central League teams, ${pacific.length} Pacific League teams`
    );

    return allStandings;
  }

  /**
   * Fetch games for a given date.
   * Not implemented yet - placeholder for interface compliance.
   */
  async fetchGames(date: string): Promise<never> {
    throw new Error('fetchGames not implemented yet');
  }
}
