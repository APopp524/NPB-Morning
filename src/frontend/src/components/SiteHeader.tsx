'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SiteHeader() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-4">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900"
          >
            NPB Morning
          </Link>
          <ul className="flex items-center space-x-4 sm:space-x-6">
            <li>
              <Link
                href="/standings"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                  isActive('/standings')
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Standings
              </Link>
            </li>
            <li>
              <Link
                href="/teams"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                  isActive('/teams')
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Teams
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

