import { Outlet, Link, ScrollRestoration } from 'react-router-dom'
import { Leaf, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl w-full mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-2 text-green-700 font-semibold text-lg hover:text-green-800">
            <Leaf className="h-5 w-5" />
            Sdílej úrodu
          </Link>
          <Button asChild size="sm" className="shrink-0">
            <Link to="/offers/new" aria-label="Přidat nabídku">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Přidat nabídku</span>
            </Link>
          </Button>
        </div>
      </header>
      <main className="max-w-5xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Toaster />
      <ScrollRestoration />
    </div>
  )
}
