/**
 * Generate a consistent team ID from the English team name.
 * This matches the database ID generation logic.
 */
export function generateTeamId(nameEn: string): string {
  return nameEn.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Normalize team name variations to their canonical English name.
 * Used when API responses have different team name formats.
 */
export function normalizeTeamNameToCanonical(teamName: string): string {
  const mapping: Record<string, string> = {
    'Tokyo Giants': 'Yomiuri Giants',
    // Add more mappings as needed
  };

  return mapping[teamName] || teamName;
}

