import { z } from 'zod'

export const UnitSchema = z.enum(['G', 'KG', 'KS'])
export const OfferStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SOLD_OUT'])
export const PickupMethodSchema = z.enum(['PERSONAL', 'NON_CONTACT', 'BOTH'])
export const ReservationPickupMethodSchema = z.enum(['PERSONAL', 'NON_CONTACT'])

export const phoneSchema = z.string().regex(
  /^\+?[0-9][0-9\s\-]{7,17}$/,
  'Neplatný formát telefonního čísla',
)
