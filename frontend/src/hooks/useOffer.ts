import { useQuery } from '@tanstack/react-query'
import { fetchOffer } from '@/api/offers'

export function useOffer(id: number) {
  return useQuery({
    queryKey: ['offers', id],
    queryFn: () => fetchOffer(id),
    enabled: !isNaN(id),
  })
}
