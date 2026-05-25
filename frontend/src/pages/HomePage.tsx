import { useOffers } from '@/hooks/useOffers'
import { OfferList } from '@/features/offers/OfferList'
import { Loader2 } from 'lucide-react'

export function HomePage() {
  const { data: offers, isPending, isError } = useOffers()

  if (isPending) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      </div>
    )
  }

  if (isError) {
    return <p className="text-center text-red-500 py-20">Nepodařilo se načíst nabídky.</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Aktuální nabídky</h1>
      <OfferList offers={offers} />
    </div>
  )
}
