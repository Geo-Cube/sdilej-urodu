import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Minus, Plus } from 'lucide-react'
import { CreateReservationSchema } from '@sdilej-urodu/shared'
import type { CreateReservation, GetOfferResponse } from '@sdilej-urodu/shared'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { pickupLabel, reservationPickupOptions } from '@/lib/labels'
import { formatQuantity } from '@/lib/format'

const labelClassName = 'mb-2 block'

type Props = {
  offer: GetOfferResponse
  onSubmit: (data: Omit<CreateReservation, 'offerId'>) => void
  isPending: boolean
}

const FormSchema = CreateReservationSchema.omit({ offerId: true })
type FormData = z.infer<typeof FormSchema>

export function ReservationForm({ offer, onSubmit, isPending }: Props) {
  const defaultPickup = offer.pickupMethod === 'BOTH' ? 'PERSONAL' : offer.pickupMethod

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      selectedPickupMethod: defaultPickup,
      reservedQuantity: offer.stepQuantity,
    },
  })

  const quantity = useWatch({ control: form.control, name: 'reservedQuantity' }) ?? offer.stepQuantity
  const max = Math.min(offer.maxQuantity ?? offer.availableQuantity, offer.availableQuantity)

  function stepDown() {
    const next = Math.round((quantity - offer.stepQuantity) * 1e10) / 1e10
    if (next >= offer.stepQuantity) {
      form.setValue('reservedQuantity', next, { shouldDirty: true, shouldValidate: true })
    }
  }

  function stepUp() {
    const next = Math.round((quantity + offer.stepQuantity) * 1e10) / 1e10
    if (next <= max) {
      form.setValue('reservedQuantity', next, { shouldDirty: true, shouldValidate: true })
    }
  }

  const totalPrice = offer.isFree ? null : offer.price * quantity

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField control={form.control} name="reserverName" render={({ field }) => (
          <FormItem>
            <FormLabel className={labelClassName}>Jméno</FormLabel>
            <FormControl><Input placeholder="Vaše jméno" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="reserverEmail" render={({ field }) => (
          <FormItem>
            <FormLabel className={labelClassName}>Email</FormLabel>
            <FormControl><Input type="email" placeholder="vas@email.cz" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="reserverPhone" render={({ field }) => (
          <FormItem>
            <FormLabel className={labelClassName}>Telefon</FormLabel>
            <FormControl><Input type="tel" placeholder="+420 777 123 456" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="reservedQuantity" render={() => (
          <FormItem>
            <FormLabel className={labelClassName}>Množství</FormLabel>
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
                  {formatQuantity(quantity, offer.unit)}
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
            <p className="text-xs text-gray-500">Krok: {formatQuantity(offer.stepQuantity, offer.unit)} | Max: {formatQuantity(max, offer.unit)}</p>
            <FormMessage />
          </FormItem>
        )} />

        {offer.pickupMethod === 'BOTH' ? (
          <FormField control={form.control} name="selectedPickupMethod" render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClassName}>Způsob vyzvednutí</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {reservationPickupOptions.map(([value, label]) => (
                    <label
                      key={value}
                      className={`flex h-11 cursor-pointer items-center rounded-md border px-3 text-sm transition-colors ${field.value === value ? 'border-green-700 bg-green-50 text-green-900' : 'border-gray-200 bg-white text-gray-700 hover:border-green-700'}`}
                    >
                      <input
                        type="radio"
                        value={value}
                        checked={field.value === value}
                        onChange={() => field.onChange(value)}
                        className="sr-only"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        ) : (
          <FormField control={form.control} name="selectedPickupMethod" render={() => (
            <FormItem>
              <FormLabel className={labelClassName}>Způsob vyzvednutí</FormLabel>
              <FormControl>
                <div className="flex h-11 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700">
                  {pickupLabel[defaultPickup]}
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
