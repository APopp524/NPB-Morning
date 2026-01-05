/**
 * Fetcher for NPB standings using SerpApi.
 * Uses anchor-team strategy for reliable standings retrieval.
 * No Supabase client usage - accepts teams as argument.
 */

import { SerpApiClient } from '../providers/serpapi/client';
import { parseStandingsFromResponse } from './standings.parser';
import { mapSerpApiTeamNameToDatabaseTeam } from './standings.mapper';
import { StandingInput } from '../models/standing';
import { Team } from '../models/team';

/**
 * Anchor teams used for team-anchored queries.
 * Team-anchored queries are more reliable than league-only queries,
 * as SerpApi league-only queries often fail to return sports_results.
 */
const ANCHOR_TEAM_BY_LEAGUE = {
  central: 'Yomiuri Giants',
  pacific: 'Fukuoka SoftBank Hawks',
} as const;

interface FetchStandingsForLeagueParams {
  serpApiClient: SerpApiClient;
  season: number;
  league: 'central' | 'pacific';
  teams: Team[];
}

/**
 * Fetch standings for a given season and league.
 * 
 * Rules:
 * - Uses anchor-team strategy (Central → Yomiuri Giants, Pacific → Fukuoka SoftBank Hawks)
 * - Enforces exactly 6 teams per league
 * - League correctness based on DB team data (teams.league)
 * - If a team appears in the wrong league → throw
 * - If a team cannot be mapped → throw
 * 
 * @param params Configuration object
 * @returns Array of StandingInput objects for the specified league
 */
export async function fetchStandingsForLeague({
  serpApiClient,
  season,
  league,
  teams,
}: FetchStandingsForLeagueParams): Promise<StandingInput[]> {
  const anchorTeam = ANCHOR_TEAM_BY_LEAGUE[league];
  const query = `${anchorTeam} standings ${season}`;

  const response = await serpApiClient.search(query);
  const parsedStandings = parseStandingsFromResponse(response, query, league);

  if (teams.length === 0) {
    throw new Error('No teams found. Teams must be provided before mapping standings.');
  }

  const standingInputs: StandingInput[] = [];
  const unmappedTeams: string[] = [];

  for (const parsed of parsedStandings) {
    let teamId: string;
    try {
      teamId = mapSerpApiTeamNameToDatabaseTeam(parsed.teamName, teams);
    } catch (error) {
      unmappedTeams.push(parsed.teamName);
      continue;
    }

    // Find the team in the database to get its league
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      throw new Error(
        `Team ID "${teamId}" not found in provided teams array. ` +
          `This should not happen if mapping is correct.`
      );
    }

    // Validate that the team belongs to the expected league
    if (team.league !== league) {
      throw new Error(
        `League mismatch: Team "${parsed.teamName}" (ID: ${teamId}) belongs to ${team.league} league, ` +
          `but was found in ${league} league standings. Query: "${query}".`
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
        `${unmappedTeams.join(', ')}. Query: "${query}".`
    );
  }

  if (standingInputs.length === 0) {
    throw new Error(
      `No standings could be mapped to database teams for ${league} league. ` +
        `Query: "${query}".`
    );
  }

  // Enforce exactly 6 teams per league
  if (standingInputs.length !== 6) {
    throw new Error(
      `${league === 'central' ? 'Central' : 'Pacific'} League returned ${standingInputs.length} teams. ` +
        `Expected exactly 6 teams.`
    );
  }

  return standingInputs;
}

interface FetchStandingsForBothLeaguesParams {
  serpApiClient: SerpApiClient;
  season: number;
  teams: Team[];
}

/**
 * Fetch standings for both leagues and merge the results.
 * Validates that each league returns exactly 6 teams and that there are no duplicates.
 * 
 * @param params Configuration object
 * @returns Array of StandingInput objects for both leagues (12 teams total)
 */
export async function fetchStandingsForBothLeagues({
  serpApiClient,
  season,
  teams,
}: FetchStandingsForBothLeaguesParams): Promise<StandingInput[]> {
  const [central, pacific] = await Promise.all([
    fetchStandingsForLeague({
      serpApiClient,
      season,
      league: 'central',
      teams,
    }),
    fetchStandingsForLeague({
      serpApiClient,
      season,
      league: 'pacific',
      teams,
    }),
  ]);

  // Validate each league has exactly 6 teams (already enforced in fetchStandingsForLeague, but double-check)
  if (central.length !== 6) {
    throw new Error(
      `Central League returned ${central.length} teams. Expected exactly 6 teams.`
    );
  }

  if (pacific.length !== 6) {
    throw new Error(
      `Pacific League returned ${pacific.length} teams. Expected exactly 6 teams.`
    );
  }

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

  return allStandings;
}

