import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-700">
        <Leaf className="h-10 w-10" />
      </div>
      <p className="text-6xl font-bold text-green-700">404</p>
      <h1 className="mt-3 text-2xl font-semibold text-gray-900">Stránka nenalezena</h1>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        Tahle adresa nikam nevede. Možná byla nabídka už zarezervována nebo jste šli po slepé cestě.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Zpět na nabídky</Link>
      </Button>
    </div>
  )
}
