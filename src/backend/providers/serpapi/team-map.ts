/**
 * Mapping from SerpApi team short names to canonical team IDs.
 * SerpApi returns short names like "Yomiuri", "DeNA", "Yakult" etc.
 * This maps them to our database team IDs.
 */
const SERPAPI_TEAM_MAP: Record<string, string> = {
  // Central League
  Yomiuri: 'yomiuri-giants',
  'Yomiuri Giants': 'yomiuri-giants',
  Hanshin: 'hanshin-tigers',
  'Hanshin Tigers': 'hanshin-tigers',
  Chunichi: 'chunichi-dragons',
  'Chunichi Dragons': 'chunichi-dragons',
  Dragons: 'chunichi-dragons',
  Yakult: 'tokyo-yakult-swallows',
  'Tokyo Yakult': 'tokyo-yakult-swallows',
  'Tokyo Yakult Swallows': 'tokyo-yakult-swallows',
  Hiroshima: 'hiroshima-toyo-carp',
  'Hiroshima Toyo': 'hiroshima-toyo-carp',
  'Hiroshima Toyo Carp': 'hiroshima-toyo-carp',
  DeNA: 'yokohama-dena-baystars',
  'Yokohama DeNA': 'yokohama-dena-baystars',
  'Yokohama DeNA BayStars': 'yokohama-dena-baystars',
  // Pacific League
  SoftBank: 'fukuoka-softbank-hawks',
  Hawks: 'fukuoka-softbank-hawks',
  'Fukuoka SoftBank': 'fukuoka-softbank-hawks',
  'Fukuoka SoftBank Hawks': 'fukuoka-softbank-hawks',
  Lotte: 'chiba-lotte-marines',
  Marines: 'chiba-lotte-marines',
  'Chiba Lotte': 'chiba-lotte-marines',
  'Chiba Lotte Marines': 'chiba-lotte-marines',
  Rakuten: 'tohoku-rakuten-golden-eagles',
  Eagles: 'tohoku-rakuten-golden-eagles',
  'Tohoku Rakuten': 'tohoku-rakuten-golden-eagles',
  'Tohoku Rakuten Golden Eagles': 'tohoku-rakuten-golden-eagles',
  Seibu: 'saitama-seibu-lions',
  Lions: 'saitama-seibu-lions',
  'Saitama Seibu': 'saitama-seibu-lions',
  'Saitama Seibu Lions': 'saitama-seibu-lions',
  'Nippon-Ham': 'hokkaido-nippon-ham-fighters',
  Fighters: 'hokkaido-nippon-ham-fighters',
  'Hokkaido Nippon-Ham': 'hokkaido-nippon-ham-fighters',
  'Hokkaido Nippon-Ham Fighters': 'hokkaido-nippon-ham-fighters',
  Orix: 'orix-buffaloes',
  Buffaloes: 'orix-buffaloes',
  'Orix Buffaloes': 'orix-buffaloes',
};

/**
 * Mapping from team ID to league.
 * Used to populate league field in standings.
 */
const TEAM_LEAGUE_MAP: Record<string, 'central' | 'pacific'> = {
  // Central League
  'yomiuri-giants': 'central',
  'hanshin-tigers': 'central',
  'chunichi-dragons': 'central',
  'tokyo-yakult-swallows': 'central',
  'hiroshima-toyo-carp': 'central',
  'yokohama-dena-baystars': 'central',
  // Pacific League
  'fukuoka-softbank-hawks': 'pacific',
  'chiba-lotte-marines': 'pacific',
  'tohoku-rakuten-golden-eagles': 'pacific',
  'saitama-seibu-lions': 'pacific',
  'hokkaido-nippon-ham-fighters': 'pacific',
  'orix-buffaloes': 'pacific',
};

/**
 * Map SerpApi team short name to canonical team ID.
 * Fails loudly if team name cannot be mapped.
 */
export function mapSerpApiTeamNameToId(teamName: string): string {
  const normalized = teamName.trim();

  // Check direct mapping
  if (SERPAPI_TEAM_MAP[normalized]) {
    return SERPAPI_TEAM_MAP[normalized];
  }

  // Try case-insensitive lookup
  const lowerName = normalized.toLowerCase();
  for (const [key, value] of Object.entries(SERPAPI_TEAM_MAP)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }

  // Fail loudly if unmapped
  throw new Error(
    `Unmapped SerpApi team name: "${teamName}". ` +
      `Team must be one of: ${Object.keys(SERPAPI_TEAM_MAP).join(', ')}. ` +
      `Teams are seeded in the database and must be mapped explicitly.`
  );
}

/**
 * Get league for a given team ID.
 * Fails loudly if team ID is not in the map.
 */
export function getLeagueForTeamId(teamId: string): 'central' | 'pacific' {
  const league = TEAM_LEAGUE_MAP[teamId];
  if (!league) {
    throw new Error(
      `Unknown league for team ID: ${teamId}. Team must be in TEAM_LEAGUE_MAP.`
    );
  }
  return league;
}

/**
 * Reverse lookup: maps lowercase team name fragments to team IDs.
 * Used for best-effort matching of team names in article titles.
 * Entries are ordered longest-first so more specific names match before short ones.
 */
const TEAM_NAME_FRAGMENTS: Array<[string, string]> = Object.entries(SERPAPI_TEAM_MAP)
  .map(([name, id]) => [name.toLowerCase(), id] as [string, string])
  .sort((a, b) => b[0].length - a[0].length);

/**
 * Attempt to match a single team in a text string (e.g. article title).
 * Returns the team ID if exactly one team is mentioned, or null if zero or multiple teams match.
 * This prevents ambiguous tagging for articles like "Giants vs Tigers".
 */
export function matchTeamInText(text: string): string | null {
  const lowerText = text.toLowerCase();
  const matchedIds = new Set<string>();

  for (const [fragment, teamId] of TEAM_NAME_FRAGMENTS) {
    if (lowerText.includes(fragment)) {
      matchedIds.add(teamId);
    }
  }

  if (matchedIds.size === 1) {
    return [...matchedIds][0];
  }

  return null;
}

/**
 * Map SerpApi team name to database team ID.
 * Prefers matching against name_en from the database, then falls back to fuzzy/partial matching.
 * 
 * @param serpApiTeamName The team name as returned by SerpApi
 * @param teams Array of teams from the database
 * @returns The team ID if found, or null if not found
 */
export function mapSerpApiTeamNameToDatabaseTeam(
  serpApiTeamName: string,
  teams: Array<{ id: string; nameEn: string; name: string }>
): string | null {
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

  // 3. Try partial match (contains) on name_en
  for (const team of teams) {
    const teamNameLower = team.nameEn.toLowerCase();
    if (teamNameLower.includes(lowerNormalized) || lowerNormalized.includes(teamNameLower)) {
      return team.id;
    }
  }

  // 4. Try fuzzy match - check if key words match
  const serpApiWords = lowerNormalized.split(/\s+/).filter(w => w.length > 2);
  for (const team of teams) {
    const teamWords = team.nameEn.toLowerCase().split(/\s+/);
    const matchingWords = serpApiWords.filter(word => 
      teamWords.some(tw => tw.includes(word) || word.includes(tw))
    );
    // If at least 2 words match, consider it a match
    if (matchingWords.length >= 2) {
      return team.id;
    }
  }

  // 5. Fall back to hardcoded map
  try {
    return mapSerpApiTeamNameToId(normalized);
  } catch {
    return null;
  }
}

