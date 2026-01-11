'use client'

import { useState } from 'react'

interface TeamIdentityProps {
  name: string
  thumbnailUrl?: string | null
  size?: 20 | 24 | 32
}

const sizeClasses = {
  20: 'w-5 h-5',
  24: 'w-6 h-6',
  32: 'w-8 h-8',
}

export function TeamIdentity({
  name,
  thumbnailUrl,
  size = 24,
}: TeamIdentityProps) {
  const [imageError, setImageError] = useState(false)
  
  // Check feature flag - default to true if not set
  const showLogos = process.env.NEXT_PUBLIC_SHOW_TEAM_LOGOS !== 'false'
  
  // Determine if we should show the image
  const shouldShowImage = showLogos && thumbnailUrl && !imageError
  const sizeClass = sizeClasses[size]

  return (
    <div className="flex items-center gap-2">
      {shouldShowImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl}
          alt={name}
          className={`${sizeClass} object-contain flex-shrink-0`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0`}
        >
          {name.charAt(0)}
        </div>
      )}
      <span className="text-gray-900">{name}</span>
    </div>
  )
}

