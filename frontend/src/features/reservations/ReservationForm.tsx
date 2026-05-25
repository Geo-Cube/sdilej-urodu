import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateReservationSchema } from '@sdilej-urodu/shared'
import type { CreateReservation, GetOfferResponse } from '@sdilej-urodu/shared'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Minus, Plus } from 'lucide-react'
import { z } from 'zod'

const unitLabel: Record<string, string> = { KG: 'kg', G: 'g', KS: 'ks' }

type Props = {
  offer: GetOfferResponse
  onSubmit: (data: Omit<CreateReservation, 'offerId'>) => void
  isPending: boolean
}

const FormSchema = CreateReservationSchema.omit({ offerId: true })
type FormData = z.infer<typeof FormSchema>

export function ReservationForm({ offer, onSubmit, isPending }: Props) {
  const defaultPickup = offer.pickupMethod === 'BOTH' ? 'PERSONAL' : offer.pickupMethod
  const [quantity, setQuantity] = useState(offer.stepQuantity)

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      selectedPickupMethod: defaultPickup as 'PERSONAL' | 'NON_CONTACT',
      reservedQuantity: offer.stepQuantity,
    },
  })

  const max = offer.maxQuantity ?? offer.availableQuantity

  function stepDown() {
    const next = Math.round((quantity - offer.stepQuantity) * 1e10) / 1e10
    if (next >= offer.stepQuantity) {
      setQuantity(next)
      form.setValue('reservedQuantity', next)
    }
  }

  function stepUp() {
    const next = Math.round((quantity + offer.stepQuantity) * 1e10) / 1e10
    if (next <= max) {
      setQuantity(next)
      form.setValue('reservedQuantity', next)
    }
  }

  const totalPrice = offer.isFree ? null : offer.price * quantity

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField control={form.control} name="reserverName" render={({ field }) => (
          <FormItem>
            <FormLabel>Jméno</FormLabel>
            <FormControl><Input placeholder="Vaše jméno" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="reserverEmail" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" placeholder="vas@email.cz" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="reserverPhone" render={({ field }) => (
          <FormItem>
            <FormLabel>Telefon</FormLabel>
            <FormControl><Input type="tel" placeholder="+420 777 123 456" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="reservedQuantity" render={({ field: _field }) => (
          <FormItem>
            <FormLabel>Množství</FormLabel>
            <FormControl>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={stepDown}
                  disabled={quantity <= offer.stepQuantity}
                  className="h-10 w-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="flex-1 text-center border border-gray-200 rounded-lg h-10 flex items-center justify-center font-medium">
                  {quantity} {unitLabel[offer.unit]}
                </div>
                <button
                  type="button"
                  onClick={stepUp}
                  disabled={quantity >= max}
                  className="h-10 w-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </FormControl>
            <p className="text-xs text-gray-500">Krok: {offer.stepQuantity} {unitLabel[offer.unit]} | Max: {max} {unitLabel[offer.unit]}</p>
            <FormMessage />
          </FormItem>
        )} />

        {offer.pickupMethod === 'BOTH' && (
          <FormField control={form.control} name="selectedPickupMethod" render={({ field }) => (
            <FormItem>
              <FormLabel>Způsob vyzvednutí</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {(['PERSONAL', 'NON_CONTACT'] as const).map((method) => (
                    <label key={method} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        value={method}
                        checked={field.value === method}
                        onChange={() => field.onChange(method)}
                        className="h-4 w-4 accent-green-700"
                      />
                      <span className="text-sm">{method === 'PERSONAL' ? 'Osobní předání' : 'Bezkontaktní stánek'}</span>
                    </label>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-gray-600">Celkem k úhradě:</span>
          <span className="font-bold text-base">
            {offer.isFree ? 'Zdarma' : `${totalPrice} Kč`}
          </span>
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Potvrdit rezervaci
        </Button>
      </form>
    </Form>
  )
}
