/**
 * Shared standings ingestion pipeline.
 * Pure business logic with no Supabase dependencies.
 */

export { parseStandingsFromResponse, ParsedStanding, StandingsResult } from './standings.parser';
export { mapSerpApiTeamNameToDatabaseTeam } from './standings.mapper';
export { validateStandingsData } from './standings.validation';
export { fetchStandingsForLeague, fetchStandingsForBothLeagues, StandingsFetchResult } from './standings.fetcher';

