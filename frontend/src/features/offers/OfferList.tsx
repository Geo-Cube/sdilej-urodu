import { OfferCard } from './OfferCard'
import type { GetOffersResponse } from '@sdilej-urodu/shared'

export function OfferList({ offers }: { offers: GetOffersResponse }) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">Žádné aktivní nabídky</p>
        <p className="text-sm mt-1">Buďte první a přidejte nabídku z vaší zahrádky.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  )
}
