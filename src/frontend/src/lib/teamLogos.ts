const TEAM_LOGOS: Record<string, string> = {
  'yomiuri-giants': '/logos/yomiuri-giants.png',
  'hanshin-tigers': '/logos/hanshin-tigers.png',
  'chunichi-dragons': '/logos/chunichi-dragons.png',
  'tokyo-yakult-swallows': '/logos/tokyo-yakult-swallows.png',
  'hiroshima-toyo-carp': '/logos/hiroshima-toyo-carp.png',
  'yokohama-dena-baystars': '/logos/yokohama-dena-baystars.png',
  'fukuoka-softbank-hawks': '/logos/fukuoka-softbank-hawks.png',
  'chiba-lotte-marines': '/logos/chiba-lotte-marines.png',
  'tohoku-rakuten-golden-eagles': '/logos/tohoku-rakuten-golden-eagles.png',
  'saitama-seibu-lions': '/logos/saitama-seibu-lions.png',
  'hokkaido-nippon-ham-fighters': '/logos/hokkaido-nippon-ham-fighters.png',
  'orix-buffaloes': '/logos/orix-buffaloes.png',
}

/**
 * Get the local logo URL for a team by its database ID.
 */
export function getTeamLogoUrl(teamId: string | undefined): string | null {
  if (teamId && TEAM_LOGOS[teamId]) {
    return TEAM_LOGOS[teamId]
  }
  return null
}
