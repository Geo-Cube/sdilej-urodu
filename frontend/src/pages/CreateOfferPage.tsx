import { useNavigate } from 'react-router-dom'
import { OfferForm } from '@/features/offers/OfferForm'
import { useCreateOffer } from '@/hooks/useCreateOffer'
import { toast } from '@/hooks/use-toast'
import type { CreateOffer } from '@sdilej-urodu/shared'

export function CreateOfferPage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateOffer()

  function onSubmit(data: CreateOffer) {
    mutate(data, {
      onSuccess: (offer) => {
        toast({ title: 'Nabídka vytvořena', description: `${offer.cropName} byla úspěšně přidána.` })
        navigate(`/offers/${offer.id}`)
      },
      onError: () => {
        toast({ title: 'Chyba', description: 'Nepodařilo se vytvořit nabídku.', variant: 'destructive' })
      },
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Nová nabídka</h1>
      <OfferForm onSubmit={onSubmit} isPending={isPending} />
    </div>
  )
}
