import type { TeamDetail } from '@/src/types/teams'

interface TeamInfoProps {
  team: TeamDetail
}

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  )
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string | null
  label: string
  icon: React.ReactNode
}) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
    >
      {icon}
    </a>
  )
}

export function TeamInfo({ team }: TeamInfoProps) {
  const hasSocials =
    team.twitter_url || team.instagram_url || team.youtube_channel_url

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Team Info
      </h2>
      <dl className="grid grid-cols-2 gap-4">
        <InfoItem label="Stadium" value={team.stadium} />
        <InfoItem label="City" value={team.city} />
      </dl>

      {/* Website */}
      {team.website_url && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <a
            href={team.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            Official Website &rarr;
          </a>
        </div>
      )}

      {/* Social Media */}
      {hasSocials && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
          <SocialLink
            href={team.twitter_url}
            label="X / Twitter"
            icon={
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            }
          />
          <SocialLink
            href={team.instagram_url}
            label="Instagram"
            icon={
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            }
          />
          <SocialLink
            href={team.youtube_channel_url}
            label="YouTube"
            icon={
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            }
          />
        </div>
      )}
    </div>
  )
}
