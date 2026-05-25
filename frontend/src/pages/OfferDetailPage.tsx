import { useParams, Link } from 'react-router-dom'
import { useOffer } from '@/hooks/useOffer'
import { useCreateReservation } from '@/hooks/useCreateReservation'
import { ReservationForm } from '@/features/reservations/ReservationForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2, MapPin, Phone, Mail, Package, User, FileText, Box } from 'lucide-react'
import { useState } from 'react'
import type { CreateReservation } from '@sdilej-urodu/shared'

const unitLabel: Record<string, string> = { KG: 'kg', G: 'g', KS: 'ks' }

const pickupLabel: Record<string, string> = {
  PERSONAL: 'Osobní předání',
  NON_CONTACT: 'Bezkontaktní stánek',
  BOTH: 'Osobní i bezkontaktní',
}

export function OfferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const offerId = Number(id)
  const { data: offer, isPending, isError } = useOffer(offerId)
  const { mutate, isPending: isReserving } = useCreateReservation(offerId)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (isPending) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      </div>
    )
  }

  if (isError || !offer) {
    return <p className="text-center text-red-500 py-20">Nabídka nebyla nalezena.</p>
  }

  function onReserve(data: Omit<CreateReservation, 'offerId'>) {
    mutate(
      { ...data, offerId },
      {
        onSuccess: () => {
          setDialogOpen(false)
          toast({ title: 'Rezervace vytvořena', description: 'Vaše rezervace byla úspěšně přijata.' })
        },
        onError: () => {
          toast({ title: 'Chyba', description: 'Nepodařilo se vytvořit rezervaci.', variant: 'destructive' })
        },
      }
    )
  }

  const isActive = offer.status === 'ACTIVE'

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Zpět na přehled
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl border border-gray-200 p-6">
        {/* Foto */}
        <div className="rounded-lg overflow-hidden bg-gray-100 aspect-4/3">
          {offer.photoUrl ? (
            <img src={offer.photoUrl} alt={offer.cropName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Package className="h-16 w-16" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{offer.cropName}</h1>
            {offer.status !== 'ACTIVE' && (
              <Badge variant="secondary">Vyprodáno</Badge>
            )}
          </div>

          <p className={`text-lg font-semibold ${offer.isFree ? 'text-green-600' : 'text-green-700'}`}>
            {offer.isFree ? 'Zdarma' : `${offer.price} Kč/${unitLabel[offer.unit]}`}
          </p>

          <p className="text-gray-700 font-medium">
            Zbývá: <strong>{offer.availableQuantity} {unitLabel[offer.unit]}</strong>
          </p>

          {offer.description && (
            <p className="text-gray-600 text-sm leading-relaxed">{offer.description}</p>
          )}

          <div className="border-t pt-4 space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-800 flex items-center gap-1.5 mb-0.5">
                <MapPin className="h-4 w-4 text-green-700" /> Adresa vyzvednutí
              </p>
              <p className="text-gray-600 pl-5">{offer.street}, {offer.city}, {offer.zipCode}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800 flex items-center gap-1.5 mb-0.5">
                <Box className="h-4 w-4 text-green-700" /> Způsob předání
              </p>
              <p className="text-gray-600 pl-5">{pickupLabel[offer.pickupMethod]}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800 flex items-center gap-1.5 mb-0.5">
                <FileText className="h-4 w-4 text-green-700" /> Doplňující instrukce
              </p>
              <p className="text-gray-600 pl-5">{offer.pickupInstructions}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800 flex items-center gap-1.5 mb-0.5">
                <User className="h-4 w-4 text-green-700" /> Pěstitel
              </p>
              <div className="pl-5 text-gray-600">
                <p>{offer.farmerName}</p>
                <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{offer.email}</p>
                {offer.phone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{offer.phone}</p>}
              </div>
            </div>
          </div>

          {isActive && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-auto">Zarezervovat část úrody</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Rezervace: {offer.cropName}</DialogTitle>
                </DialogHeader>
                <ReservationForm offer={offer} onSubmit={onReserve} isPending={isReserving} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}
