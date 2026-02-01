import { TeamIdentity } from '../TeamIdentity'

interface GameCardProps {
  homeTeam: {
    name_en: string
    thumbnail_url: string | null
  }
  awayTeam: {
    name_en: string
    thumbnail_url: string | null
  }
  homeScore: number | null
  awayScore: number | null
  gameDate: string
  gameTime?: string | null
  venue?: string | null
}

export function GameCard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  gameDate,
  gameTime,
  venue,
}: GameCardProps) {
  const hasScore = homeScore !== null && awayScore !== null
  
  // Determine winner for styling (optional subtle highlight)
  const homeWon = hasScore && homeScore > awayScore
  const awayWon = hasScore && awayScore > homeScore

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-5">
      {/* Date & Time Header */}
      <div className="text-xs text-gray-500 font-medium mb-4 text-center">
        {gameDate}{gameTime && ` | ${gameTime}`}
      </div>

      {/* Matchup */}
      <div className="flex items-center justify-between gap-3">
        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center text-center">
          <TeamLogo
            name={awayTeam.name_en}
            thumbnailUrl={awayTeam.thumbnail_url}
            isWinner={awayWon}
          />
          <span className={`text-sm mt-2 font-medium ${awayWon ? 'text-gray-900' : 'text-gray-700'}`}>
            {awayTeam.name_en}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2 px-3">
          {hasScore ? (
            <>
              <span className={`text-2xl font-bold tabular-nums ${awayWon ? 'text-gray-900' : 'text-gray-600'}`}>
                {awayScore}
              </span>
              <span className="text-gray-400 text-lg">-</span>
              <span className={`text-2xl font-bold tabular-nums ${homeWon ? 'text-gray-900' : 'text-gray-600'}`}>
                {homeScore}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400 font-medium">vs</span>
          )}
        </div>

        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center text-center">
          <TeamLogo
            name={homeTeam.name_en}
            thumbnailUrl={homeTeam.thumbnail_url}
            isWinner={homeWon}
          />
          <span className={`text-sm mt-2 font-medium ${homeWon ? 'text-gray-900' : 'text-gray-700'}`}>
            {homeTeam.name_en}
          </span>
        </div>
      </div>

      {/* Venue */}
      {venue && (
        <div className="text-xs text-gray-400 text-center mt-4 truncate">
          {venue}
        </div>
      )}
    </div>
  )
}

// Internal component for team logos - larger size for cards
interface TeamLogoProps {
  name: string
  thumbnailUrl: string | null
  isWinner?: boolean
}

function TeamLogo({ name, thumbnailUrl, isWinner }: TeamLogoProps) {
  const showLogos = process.env.NEXT_PUBLIC_SHOW_TEAM_LOGOS !== 'false'

  if (showLogos && thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbnailUrl}
        alt={name}
        className={`w-9 h-9 object-contain ${isWinner ? 'opacity-100' : 'opacity-80'}`}
      />
    )
  }

  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-semibold ${
        isWinner ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {name.charAt(0)}
    </div>
  )
}
