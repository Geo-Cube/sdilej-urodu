import { useNavigate } from 'react-router-dom'
import { OfferForm } from '@/features/offers/OfferForm'
import { useCreateOffer } from '@/hooks/useCreateOffer'
import { toast } from '@/hooks/use-toast'
import { PageHeading } from '@/components/PageState'
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
      <PageHeading>Nová nabídka</PageHeading>
      <OfferForm onSubmit={onSubmit} isPending={isPending} />
    </div>
  )
}
