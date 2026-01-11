import { Nav } from './Nav'
import { Footer } from './Footer'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <Nav />
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

