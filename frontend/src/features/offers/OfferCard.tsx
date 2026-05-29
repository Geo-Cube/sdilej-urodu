import { Link } from 'react-router-dom'
import { MapPin, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OfferImage } from '@/components/OfferImage'
import { formatPrice, formatQuantity } from '@/lib/format'
import type { GetOffersResponse } from '@sdilej-urodu/shared'

type Offer = GetOffersResponse[number]

export function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <Link
        to={`/offers/${offer.id}`}
        aria-label={`Zobrazit detail nabídky ${offer.cropName}`}
        className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
      />
      <div className="aspect-4/3 bg-gray-100 overflow-hidden">
        <OfferImage photoUrl={offer.photoUrl} alt={offer.cropName} />
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="wrap-break-word text-base font-bold leading-tight text-gray-900">{offer.cropName}</h3>

        <p className={`font-semibold text-sm ${offer.isFree ? 'text-green-600' : 'text-green-700'}`}>
          {formatPrice(offer)}
        </p>

        <div className="flex flex-col gap-1 text-sm text-gray-500 flex-1">
          <span className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 shrink-0" />
            Zbývá: <strong>{formatQuantity(offer.availableQuantity, offer.unit)}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {offer.city}
          </span>
        </div>

        <Button asChild variant="outline" size="sm" className="relative z-20 w-full mt-2">
          <Link to={`/offers/${offer.id}`}>Zobrazit detail</Link>
        </Button>
      </div>
    </div>
  )
}
