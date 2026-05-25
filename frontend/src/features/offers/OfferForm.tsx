import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreateOfferSchema } from '@sdilej-urodu/shared'
import type { CreateOffer } from '@sdilej-urodu/shared'

type CreateOfferInput = z.input<typeof CreateOfferSchema>
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, UploadCloud } from 'lucide-react'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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
    defaultValues: {
      isFree: false,
      unit: 'KG',
      pickupMethod: 'PERSONAL',
    },
  })

  const isFree = form.watch('isFree')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Section title="Základní informace">
          <FormField control={form.control} name="photoUrl" render={({ field }) => (
            <FormItem>
              <FormLabel>Fotografie</FormLabel>
              <FormControl>
                <div className="relative">
                  {field.value ? (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video">
                      <img src={field.value} alt="Náhled" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => field.onChange(null)}
                        className="absolute top-2 right-2 bg-white rounded-full px-2 py-0.5 text-xs border border-gray-200 hover:bg-gray-50"
                      >
                        Odebrat
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                      <UploadCloud className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Vložte URL fotografie</span>
                      <span className="text-xs text-gray-400">nebo zadejte přímo níže</span>
                      <input
                        type="url"
                        placeholder="https://..."
                        className="mt-2 w-full max-w-xs text-xs border border-gray-200 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-green-600"
                        onChange={e => field.onChange(e.target.value || null)}
                      />
                    </label>
                  )}
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
                  <Input type="number" step="any" placeholder="např. 50" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="stepQuantity" render={({ field }) => (
              <FormItem>
                <FormLabel>Balení po (Krok) *</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="např. 2" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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
                    onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
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
                    <SelectItem value="KG">kg</SelectItem>
                    <SelectItem value="G">g</SelectItem>
                    <SelectItem value="KS">ks</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="flex items-end gap-4">
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Cena *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="any"
                      placeholder="např. 40"
                      disabled={isFree}
                      {...field}
                      value={isFree ? '' : (field.value ?? '')}
                      onChange={e => field.onChange(Number(e.target.value))}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Kč</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="isFree" render={({ field }) => (
              <FormItem className="flex items-center gap-2 pb-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value ?? false}
                    onChange={e => field.onChange(e.target.checked)}
                    className="h-4 w-4 accent-green-700"
                  />
                </FormControl>
                <FormLabel className="cursor-pointer font-normal">Zdarma</FormLabel>
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
              <FormControl><Input type="tel" placeholder="+420..." {...field} value={field.value ?? ''} /></FormControl>
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
                  <SelectItem value="PERSONAL">Osobní odběr</SelectItem>
                  <SelectItem value="NON_CONTACT">Bezkontaktní</SelectItem>
                  <SelectItem value="BOTH">Obojí</SelectItem>
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
