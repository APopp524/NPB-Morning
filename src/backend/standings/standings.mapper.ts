/**
 * Mapping from SerpApi team names to database team IDs.
 * Simplified mapping with no fuzzy matching - fails loudly if team cannot be mapped.
 */

import { Team } from '../models/team';

/**
 * Explicit alias map for SerpApi team names that don't match name_en exactly.
 * Small and intentional - only add entries when necessary.
 */
const SERPAPI_TEAM_ALIAS_MAP: Record<string, string> = {
  // Central League
  Yomiuri: 'Yomiuri Giants',
  'Yomiuri Giants': 'Yomiuri Giants',
  Hanshin: 'Hanshin Tigers',
  'Hanshin Tigers': 'Hanshin Tigers',
  Chunichi: 'Chunichi Dragons',
  'Chunichi Dragons': 'Chunichi Dragons',
  Dragons: 'Chunichi Dragons',
  Yakult: 'Tokyo Yakult Swallows',
  'Tokyo Yakult': 'Tokyo Yakult Swallows',
  'Tokyo Yakult Swallows': 'Tokyo Yakult Swallows',
  Hiroshima: 'Hiroshima Toyo Carp',
  'Hiroshima Toyo': 'Hiroshima Toyo Carp',
  'Hiroshima Toyo Carp': 'Hiroshima Toyo Carp',
  DeNA: 'Yokohama DeNA BayStars',
  'Yokohama DeNA': 'Yokohama DeNA BayStars',
  'Yokohama DeNA BayStars': 'Yokohama DeNA BayStars',
  // Pacific League
  SoftBank: 'Fukuoka SoftBank Hawks',
  Hawks: 'Fukuoka SoftBank Hawks',
  'Fukuoka SoftBank': 'Fukuoka SoftBank Hawks',
  'Fukuoka SoftBank Hawks': 'Fukuoka SoftBank Hawks',
  Lotte: 'Chiba Lotte Marines',
  Marines: 'Chiba Lotte Marines',
  'Chiba Lotte': 'Chiba Lotte Marines',
  'Chiba Lotte Marines': 'Chiba Lotte Marines',
  Rakuten: 'Tohoku Rakuten Golden Eagles',
  Eagles: 'Tohoku Rakuten Golden Eagles',
  'Tohoku Rakuten': 'Tohoku Rakuten Golden Eagles',
  'Tohoku Rakuten Golden Eagles': 'Tohoku Rakuten Golden Eagles',
  Seibu: 'Saitama Seibu Lions',
  Lions: 'Saitama Seibu Lions',
  'Saitama Seibu': 'Saitama Seibu Lions',
  'Saitama Seibu Lions': 'Saitama Seibu Lions',
  'Nippon-Ham': 'Hokkaido Nippon-Ham Fighters',
  Fighters: 'Hokkaido Nippon-Ham Fighters',
  'Hokkaido Nippon-Ham': 'Hokkaido Nippon-Ham Fighters',
  'Hokkaido Nippon-Ham Fighters': 'Hokkaido Nippon-Ham Fighters',
  Orix: 'Orix Buffaloes',
  Buffaloes: 'Orix Buffaloes',
  'Orix Buffaloes': 'Orix Buffaloes',
};

/**
 * Map SerpApi team name to database team ID.
 * 
 * Rules:
 * - Exact match on teams.name_en
 * - Case-insensitive match on name_en
 * - Explicit alias map only (small + intentional)
 * 
 * If a team cannot be mapped → throw (do not silently skip or guess).
 * 
 * @param serpApiTeamName The team name as returned by SerpApi
 * @param teams Array of teams from the database
 * @returns The team ID
 * @throws Error if team cannot be mapped
 */
export function mapSerpApiTeamNameToDatabaseTeam(
  serpApiTeamName: string,
  teams: Team[]
): string {
  const normalized = serpApiTeamName.trim();
  const lowerNormalized = normalized.toLowerCase();

  // 1. Try exact match on name_en
  for (const team of teams) {
    if (team.nameEn === normalized) {
      return team.id;
    }
  }

  // 2. Try case-insensitive match on name_en
  for (const team of teams) {
    if (team.nameEn.toLowerCase() === lowerNormalized) {
      return team.id;
    }
  }

  // 3. Try explicit alias map (maps to canonical name_en, then find team)
  const canonicalName = SERPAPI_TEAM_ALIAS_MAP[normalized];
  if (canonicalName) {
    for (const team of teams) {
      if (team.nameEn === canonicalName) {
        return team.id;
      }
    }
    // Alias exists but team not found in DB - this is a data issue
    throw new Error(
      `Team alias "${normalized}" maps to "${canonicalName}", but no team with that name_en found in database.`
    );
  }

  // 4. Fail loudly - no fuzzy matching, no guessing
  const availableNames = teams.map(t => t.nameEn).join(', ');
  throw new Error(
    `Could not map SerpApi team name "${serpApiTeamName}" to any database team. ` +
      `Available teams: ${availableNames}. ` +
      `Team must match name_en exactly (case-insensitive) or be in the explicit alias map.`
  );
}

