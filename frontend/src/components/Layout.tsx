import { Outlet, Link } from 'react-router-dom'
import { Leaf, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-green-700 font-semibold text-lg hover:text-green-800">
            <Leaf className="h-5 w-5" />
            Sdílej úrodu
          </Link>
          <Button asChild size="sm">
            <Link to="/offers/new">
              <Plus className="h-4 w-4" />
              Přidat nabídku
            </Link>
          </Button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
