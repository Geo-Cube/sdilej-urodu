import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CreateOfferSchema,
  getOfferQuantityRelationErrors,
  quantityValidationMessages,
  type OfferQuantityRelationField,
} from '@sdilej-urodu/shared'
import type { CreateOffer } from '@sdilej-urodu/shared'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { pickupOptions, unitOptions } from '@/lib/labels'
import { Loader2, UploadCloud } from 'lucide-react'

type CreateOfferInput = z.input<typeof CreateOfferSchema>

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isValidUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim() === '') return false

  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

export function OfferForm({ onSubmit, isPending }: { onSubmit: (data: CreateOffer) => void; isPending: boolean }) {
  const form = useForm<CreateOfferInput, unknown, CreateOffer>({
    resolver: zodResolver(CreateOfferSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      isFree: false,
      price: undefined,
      unit: 'KG',
      pickupMethod: 'PERSONAL',
    },
  })

  const isFree = useWatch({ control: form.control, name: 'isFree' })
  const availableQuantity = useWatch({ control: form.control, name: 'availableQuantity' })
  const stepQuantity = useWatch({ control: form.control, name: 'stepQuantity' })
  const maxQuantity = useWatch({ control: form.control, name: 'maxQuantity' })
  const previousPriceRef = useRef<number | undefined>(undefined)

  const setQuantityValue = (
    field: 'availableQuantity' | 'stepQuantity' | 'maxQuantity',
    value: number | null | undefined,
  ) => {
    form.setValue(field, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    })
  }

  const validateQuantityRelations = useCallback((
    nextAvailableQuantity: unknown,
    nextStepQuantity: unknown,
    nextMaxQuantity: unknown,
  ) => {
    const relationMessages: readonly string[] = Object.values(quantityValidationMessages)

    const clearRelationError = (field: OfferQuantityRelationField) => {
      const message = form.getFieldState(field).error?.message
      if (message && relationMessages.includes(message)) {
        form.clearErrors(field)
      }
    }

    if (!isPositiveNumber(nextAvailableQuantity) || !isPositiveNumber(nextStepQuantity)) {
      clearRelationError('availableQuantity')
      clearRelationError('stepQuantity')
      clearRelationError('maxQuantity')
      return
    }

    const errors = getOfferQuantityRelationErrors({
      availableQuantity: nextAvailableQuantity,
      stepQuantity: nextStepQuantity,
      maxQuantity: isPositiveNumber(nextMaxQuantity) ? nextMaxQuantity : null,
    })

    for (const field of ['availableQuantity', 'stepQuantity', 'maxQuantity'] as const) {
      const message = errors[field]
      if (message) {
        form.setError(field, { type: 'manual', message })
      } else {
        clearRelationError(field)
      }
    }
  }, [form])

  useEffect(() => {
    validateQuantityRelations(availableQuantity, stepQuantity, maxQuantity)
  }, [availableQuantity, maxQuantity, stepQuantity, validateQuantityRelations])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Section title="Základní informace">
          <FormField control={form.control} name="photoUrl" render={({ field }) => (
            <FormItem>
              <FormLabel>Fotografie</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  {isValidUrl(field.value) ? (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video">
                      <img
                        src={field.value}
                        alt="Náhled"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => field.onChange(null)}
                        className="absolute top-2 right-2 bg-white rounded-full px-2 py-0.5 text-xs border border-gray-200 hover:bg-gray-50"
                      >
                        Odebrat
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <UploadCloud className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Vložte URL fotografie</span>
                      <span className="text-xs text-gray-400">nebo zadejte přímo níže</span>
                    </div>
                  )}
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="cropName" render={({ field }) => (
            <FormItem>
              <FormLabel>Název plodiny *</FormLabel>
              <FormControl><Input placeholder="např. Jablka Idared" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Popis <span className="text-gray-400 font-normal">(volitelný)</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Popište kvalitu, odrůdu, nebo zvláštnosti vaší úrody..."
                  className="min-h-25"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </Section>

        <Section title="Množství a cena">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="availableQuantity" render={({ field }) => (
              <FormItem>
                <FormLabel>Celkové množství *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="např. 50"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const nextValue = e.target.value === '' ? undefined : Number(e.target.value)
                      setQuantityValue('availableQuantity', nextValue)
                      validateQuantityRelations(nextValue, stepQuantity, maxQuantity)
                    }}
                    onBlur={() => validateQuantityRelations(availableQuantity, stepQuantity, maxQuantity)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="stepQuantity" render={({ field }) => (
              <FormItem>
                <FormLabel>Krok balení *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="např. 2"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setQuantityValue('stepQuantity', undefined)
                        validateQuantityRelations(availableQuantity, undefined, maxQuantity)
                        return
                      }
                      const val = Number(e.target.value)
                      const nextValue = isPositiveNumber(availableQuantity) && val > availableQuantity ? availableQuantity : val
                      setQuantityValue('stepQuantity', nextValue)
                      validateQuantityRelations(availableQuantity, nextValue, maxQuantity)
                    }}
                    onBlur={() => validateQuantityRelations(availableQuantity, stepQuantity, maxQuantity)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="maxQuantity" render={({ field }) => (
              <FormItem>
                <FormLabel>Max. na osobu</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="např. 10"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setQuantityValue('maxQuantity', null)
                        validateQuantityRelations(availableQuantity, stepQuantity, null)
                        return
                      }
                      const val = Number(e.target.value)
                      const nextValue = isPositiveNumber(availableQuantity) && val > availableQuantity ? availableQuantity : val
                      setQuantityValue('maxQuantity', nextValue)
                      validateQuantityRelations(availableQuantity, stepQuantity, nextValue)
                    }}
                    onBlur={() => validateQuantityRelations(availableQuantity, stepQuantity, maxQuantity)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="unit" render={({ field }) => (
              <FormItem>
                <FormLabel>Jednotka *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {unitOptions.map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem>
                <FormLabel>Cena {!isFree && '*'}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="any"
                      placeholder="např. 40"
                      disabled={isFree}
                      {...field}
                      value={isFree ? '' : (field.value ?? '')}
                      onChange={(e) => {
                        const nextPrice = e.target.value === '' ? undefined : Number(e.target.value)
                        previousPriceRef.current = nextPrice
                        field.onChange(nextPrice)
                      }}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Kč</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="isFree" render={({ field }) => (
              <FormItem className="self-start space-y-2">
                <div className="h-5" aria-hidden="true" />
                <div className="flex h-10 items-center gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value ?? false}
                      onChange={(e) => {
                        const checked = e.target.checked

                        if (checked) {
                          const currentPrice = form.getValues('price')
                          previousPriceRef.current = currentPrice && currentPrice > 0 ? currentPrice : undefined
                          form.setValue('price', 0, { shouldValidate: true })
                        } else if (previousPriceRef.current !== undefined) {
                          form.setValue('price', previousPriceRef.current, { shouldValidate: true })
                        } else {
                          form.resetField('price')
                        }

                        field.onChange(checked)
                      }}
                      className="h-4 w-4 accent-green-700"
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">Zdarma</FormLabel>
                </div>
              </FormItem>
            )} />
          </div>
        </Section>

        <Section title="Kontakt a místo">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="farmerName" render={({ field }) => (
              <FormItem>
                <FormLabel>Jméno *</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon <span className="text-gray-400 font-normal">(volitelný)</span></FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+420..."
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-3 gap-4">
            <FormField control={form.control} name="street" render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Ulice *</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="zipCode" render={({ field }) => (
              <FormItem>
                <FormLabel>PSČ *</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="city" render={({ field }) => (
            <FormItem>
              <FormLabel>Město *</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </Section>

        <Section title="Vyzvednutí">
          <FormField control={form.control} name="pickupMethod" render={({ field }) => (
            <FormItem>
              <FormLabel>Způsob vyzvednutí *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {pickupOptions.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="pickupInstructions" render={({ field }) => (
            <FormItem>
              <FormLabel>Instrukce k vyzvednutí *</FormLabel>
              <FormControl><Textarea placeholder="Jak se dostat k zásilce..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </Section>

        <Button type="submit" disabled={isPending} className="w-full" size="lg">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Zveřejnit nabídku
        </Button>
      </form>
    </Form>
  )
}
