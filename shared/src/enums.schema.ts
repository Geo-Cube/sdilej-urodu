import { z } from 'zod'

export const UnitSchema = z.enum(['G', 'KG', 'KS'], { error: 'Vyberte jednotku' })
export const OfferStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SOLD_OUT'], { error: 'Neplatný stav nabídky' })
export const PickupMethodSchema = z.enum(['PERSONAL', 'NON_CONTACT', 'BOTH'], { error: 'Vyberte způsob vyzvednutí' })
export const ReservationPickupMethodSchema = z.enum(['PERSONAL', 'NON_CONTACT'], { error: 'Vyberte způsob vyzvednutí' })

export const phoneSchema = z.string({ error: 'Zadejte telefonní číslo' }).regex(
  /^\+?[0-9][0-9\s\-]{7,17}$/,
  'Zadejte telefon ve správném formátu',
)
