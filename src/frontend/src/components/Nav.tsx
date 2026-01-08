'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Nav() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          NPB Morning
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link
              href="/standings"
              className={`transition-colors ${
                isActive('/standings')
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Standings
            </Link>
          </li>
          <li>
            <Link
              href="/teams"
              className={`transition-colors ${
                isActive('/teams')
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Teams
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

