'use client'

import { useState } from 'react'
import type { TeamDetail } from '@/src/types/teams'

interface TeamHeroProps {
  team: TeamDetail
}

export function TeamHero({ team }: TeamHeroProps) {
  const [imageError, setImageError] = useState(false)
  const showLogos = process.env.NEXT_PUBLIC_SHOW_TEAM_LOGOS !== 'false'
  const shouldShowLogo = showLogos && team.thumbnail_url && !imageError

  const leagueLabel =
    team.league === 'central' ? 'Central League' : 'Pacific League'

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-950 text-white">
      <div className="px-6 py-10 sm:px-10 sm:py-14 flex items-center gap-6">
        {shouldShowLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={team.thumbnail_url!}
            alt={team.name_en}
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain flex-shrink-0 drop-shadow-lg"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold flex-shrink-0">
            {team.name_en.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {team.name_en}
          </h1>
          <p className="text-lg text-white/70 mt-1">{team.name}</p>
          <span className="inline-block mt-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/15 rounded-full">
            {leagueLabel}
          </span>
        </div>
      </div>
    </div>
  )
}
