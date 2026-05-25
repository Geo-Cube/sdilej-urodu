import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createReservation } from '@/api/reservations'

export function useCreateReservation(offerId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', offerId] })
      queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
  })
}
