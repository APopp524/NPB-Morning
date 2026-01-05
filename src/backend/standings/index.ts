/**
 * Shared standings ingestion pipeline.
 * Pure business logic with no Supabase dependencies.
 */

export { parseStandingsFromResponse, ParsedStanding } from './standings.parser';
export { mapSerpApiTeamNameToDatabaseTeam } from './standings.mapper';
export { validateStandingsData } from './standings.validation';
export { fetchStandingsForLeague, fetchStandingsForBothLeagues } from './standings.fetcher';

