import { Link } from 'react-router-dom'
import { MapPin, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GetOffersResponse } from '@sdilej-urodu/shared'

type Offer = GetOffersResponse[number]

const unitLabel: Record<string, string> = { KG: 'kg', G: 'g', KS: 'ks' }

export function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="aspect-4/3 bg-gray-100 overflow-hidden">
        {offer.photoUrl ? (
          <img src={offer.photoUrl} alt={offer.cropName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package className="h-12 w-12" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-bold text-gray-900 text-base leading-tight">{offer.cropName}</h3>

        <p className={`font-semibold text-sm ${offer.isFree ? 'text-green-600' : 'text-green-700'}`}>
          {offer.isFree ? 'Zdarma' : `${offer.price} Kč/${unitLabel[offer.unit]}`}
        </p>

        <div className="flex flex-col gap-1 text-sm text-gray-500 flex-1">
          <span className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 shrink-0" />
            Zbývá: {offer.availableQuantity} {unitLabel[offer.unit]}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {offer.city}
          </span>
        </div>

        <Button asChild variant="outline" size="sm" className="w-full mt-2">
          <Link to={`/offers/${offer.id}`}>Zobrazit detail</Link>
        </Button>
      </div>
    </div>
  )
}
