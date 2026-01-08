import Link from 'next/link'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              NPB Morning
            </Link>
            <ul className="flex space-x-6">
              <li>
                <Link
                  href="/"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/standings"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Standings
                </Link>
              </li>
              <li>
                <Link
                  href="/teams"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Teams
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}

