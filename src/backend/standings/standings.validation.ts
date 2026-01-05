/**
 * Validation for standings data before database writes.
 * Enforces data integrity rules and throws errors on violations.
 */

import { StandingInput } from '../models/standing';

/**
 * Validate standings data before DB writes.
 * 
 * Rules:
 * - Exactly 12 rows
 * - Exactly 6 Central + 6 Pacific
 * - Unique (teamId, season)
 * 
 * Throws errors (no logging).
 */
export function validateStandingsData(standings: StandingInput[]): void {
  if (standings.length !== 12) {
    throw new Error(`Expected exactly 12 standings rows, got ${standings.length}`);
  }

  const centralCount = standings.filter(s => s.league === 'central').length;
  const pacificCount = standings.filter(s => s.league === 'pacific').length;
  
  if (centralCount !== 6) {
    throw new Error(`Expected exactly 6 Central League teams, got ${centralCount}`);
  }
  
  if (pacificCount !== 6) {
    throw new Error(`Expected exactly 6 Pacific League teams, got ${pacificCount}`);
  }

  const seenTeamIds = new Set<string>();
  const duplicates: string[] = [];
  
  for (const standing of standings) {
    const key = `${standing.season}-${standing.teamId}`;
    if (seenTeamIds.has(key)) {
      duplicates.push(key);
    }
    seenTeamIds.add(key);
  }
  
  if (duplicates.length > 0) {
    throw new Error(`Duplicate teamId + season entries detected: ${duplicates.join(', ')}`);
  }
}

