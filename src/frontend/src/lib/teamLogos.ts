const TEAM_IDS = [
  'yomiuri-giants',
  'hanshin-tigers',
  'chunichi-dragons',
  'tokyo-yakult-swallows',
  'hiroshima-toyo-carp',
  'yokohama-dena-baystars',
  'fukuoka-softbank-hawks',
  'chiba-lotte-marines',
  'tohoku-rakuten-golden-eagles',
  'saitama-seibu-lions',
  'hokkaido-nippon-ham-fighters',
  'orix-buffaloes',
] as const

const TEAM_ID_SET = new Set<string>(TEAM_IDS)

/** Small 48px logo for compact views (standings, team list, scores). */
export function getTeamLogoUrl(teamId: string | undefined): string | null {
  if (teamId && TEAM_ID_SET.has(teamId)) {
    return `/logos/${teamId}.png`
  }
  return null
}

/** Larger high-res logo for the team detail page. */
export function getTeamLogoLargeUrl(teamId: string | undefined): string | null {
  if (teamId && TEAM_ID_SET.has(teamId)) {
    return `/teams/${teamId}/logo.png`
  }
  return null
}
