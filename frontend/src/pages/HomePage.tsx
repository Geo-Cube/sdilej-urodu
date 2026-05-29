import { useOffers } from '@/hooks/useOffers'
import { OfferList } from '@/features/offers/OfferList'
import { PageError, PageHeading, PageSpinner } from '@/components/PageState'

export function HomePage() {
  const { data: offers, isPending, isError } = useOffers()

  if (isPending) return <PageSpinner />
  if (isError) return <PageError message="Nepodařilo se načíst nabídky." />

  return (
    <div>
      <PageHeading>Aktuální nabídky</PageHeading>
      <OfferList offers={offers} />
    </div>
  )
}
