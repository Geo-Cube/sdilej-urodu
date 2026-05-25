import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createOffer } from '@/api/offers'

export function useCreateOffer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
  })
}
