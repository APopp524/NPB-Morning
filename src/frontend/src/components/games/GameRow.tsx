import { TeamIdentity } from '../TeamIdentity'

interface GameRowProps {
  homeTeam: {
    name_en: string;
    thumbnail_url: string | null;
  };
  awayTeam: {
    name_en: string;
    thumbnail_url: string | null;
  };
  gameDate: string;
  venue?: string | null;
}

export function GameRow({ 
  homeTeam, 
  awayTeam, 
  gameDate, 
  venue 
}: GameRowProps) {
  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="text-sm text-gray-500 min-w-[80px]">
            {gameDate}
          </div>
          <div className="flex-1 flex items-center justify-between gap-4">
            {/* Away team with logo */}
            <div className="flex-1">
              <TeamIdentity
                name={awayTeam.name_en}
                thumbnailUrl={awayTeam.thumbnail_url}
                size={24}
              />
            </div>
            <div className="text-gray-400">@</div>
            {/* Home team with logo */}
            <div className="flex-1 flex justify-end">
              <TeamIdentity
                name={homeTeam.name_en}
                thumbnailUrl={homeTeam.thumbnail_url}
                size={24}
              />
            </div>
          </div>
        </div>
        {venue && (
          <div className="text-xs text-gray-500 min-w-[120px] text-right">
            {venue}
          </div>
        )}
      </div>
    </div>
  );
}
