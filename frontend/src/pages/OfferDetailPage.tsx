import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { MapPin, Phone, Mail, User, FileText, Box } from 'lucide-react'
import { useOffer } from '@/hooks/useOffer'
import { useCreateReservation } from '@/hooks/useCreateReservation'
import { ReservationForm } from '@/features/reservations/ReservationForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OfferImage } from '@/components/OfferImage'
import { PageError, PageSpinner } from '@/components/PageState'
import { toast } from '@/hooks/use-toast'
import { pickupLabel } from '@/lib/labels'
import { formatPrice, formatQuantity } from '@/lib/format'
import axios from 'axios'
import type { CreateReservation } from '@sdilej-urodu/shared'

function getReservationErrorMessage(error: unknown) {
  if (!axios.isAxiosError<{ message?: string }>(error)) {
    return 'Nepodařilo se vytvořit rezervaci. Zkuste to prosím znovu.'
  }

  const message = error.response?.data?.message
  if (message && message !== 'Validation error') {
    return message
  }

  if (error.response?.status === 400) {
    return 'Zkontrolujte prosím množství a kontaktní údaje.'
  }

  return 'Nepodařilo se vytvořit rezervaci. Zkuste to prosím znovu.'
}

export function OfferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const offerId = Number(id)
  const hasValidOfferId = Number.isFinite(offerId) && offerId > 0
  const { data: offer, isPending, isError } = useOffer(offerId)
  const { mutate, isPending: isReserving } = useCreateReservation(offerId)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!hasValidOfferId) {
    return <PageError message="Nabídka nebyla nalezena." />
  }

  if (isPending) {
    return <PageSpinner />
  }

  if (isError || !offer) {
    return <PageError message="Nabídka nebyla nalezena." />
  }

  function onReserve(data: Omit<CreateReservation, 'offerId'>) {
    mutate(
      { ...data, offerId },
      {
        onSuccess: () => {
          setDialogOpen(false)
          toast({
            title: 'Rezervace proběhla úspěšně',
            description: 'Brzy se domluvíte na vyzvednutí.',
            variant: 'success',
          })
        },
        onError: (error) => {
          toast({
            title: 'Rezervaci se nepodařilo vytvořit',
            description: getReservationErrorMessage(error),
            variant: 'destructive',
          })
        },
      },
    )
  }

  const isActive = offer.status === 'ACTIVE'

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="grid min-w-0 grid-cols-1 gap-8 rounded-xl border border-gray-200 bg-white p-6 md:grid-cols-2">
        <div className="rounded-lg overflow-hidden bg-gray-100 aspect-4/3">
          <OfferImage photoUrl={offer.photoUrl} alt={offer.cropName} iconClassName="h-16 w-16" />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <h1 className="wrap-break-word text-2xl font-bold text-gray-900">{offer.cropName}</h1>
            {offer.status !== 'ACTIVE' && <Badge variant="secondary">Vyprodáno</Badge>}
          </div>

          <p className={`text-lg font-bold ${offer.isFree ? 'text-green-600' : 'text-green-700'}`}>
            {formatPrice(offer)}
          </p>

          <p className="text-gray-700 font-medium">
            Zbývá: <strong>{formatQuantity(offer.availableQuantity, offer.unit)}</strong>
          </p>

          {offer.description && (
            <p className="wrap-break-word text-sm leading-relaxed text-gray-600">{offer.description}</p>
          )}

          <div className="border-t pt-4 space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-800 flex items-center gap-1.5 mb-0.5">
                <MapPin className="h-4 w-4 text-green-700" /> Adresa vyzvednutí
              </p>
              <p className="wrap-break-word pl-5 text-gray-600">{offer.street}, {offer.city}, {offer.zipCode}</p>
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
              <p className="wrap-break-word pl-5 text-gray-600">{offer.pickupInstructions}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800 flex items-center gap-1.5 mb-0.5">
                <User className="h-4 w-4 text-green-700" /> Pěstitel
              </p>
              <div className="pl-5 text-gray-600">
                <p>{offer.farmerName}</p>
                <a className="flex items-center gap-1 break-all hover:text-green-700" href={`mailto:${offer.email}`}>
                  <Mail className="h-3 w-3 shrink-0" />{offer.email}
                </a>
                {offer.phone && (
                  <a className="flex items-center gap-1 break-all hover:text-green-700" href={`tel:${offer.phone}`}>
                    <Phone className="h-3 w-3 shrink-0" />{offer.phone}
                  </a>
                )}
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

          {!isActive && (
            <div className="mt-auto rounded-lg border border-red-200 bg-red-100 px-4 py-3 text-center font-semibold text-red-700">
              Vyprodáno
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
