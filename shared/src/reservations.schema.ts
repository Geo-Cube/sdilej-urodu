import { z } from 'zod'
import { ReservationPickupMethodSchema, phoneSchema } from './enums.schema.js'

export const ReservationSchema = z.object({
  id: z.number().int(),
  offerId: z.number().int(),
  reserverName: z.string(),
  reserverEmail: z.string(),
  reserverPhone: z.string(),
  reservedQuantity: z.number(),
  selectedPickupMethod: ReservationPickupMethodSchema,
  createdAt: z.coerce.date(),
})

export const CreateReservationSchema = z.object({
  offerId: z.number({ error: 'Neplatná nabídka' }).int('Neplatná nabídka').positive('Neplatná nabídka'),
  reserverName: z.string({ error: 'Zadejte jméno' }).min(1, 'Zadejte jméno'),
  reserverEmail: z.email({ error: 'Zadejte platný email' }),
  reserverPhone: phoneSchema,
  reservedQuantity: z.number({ error: 'Zadejte množství' }).positive('Množství musí být větší než 0'),
  selectedPickupMethod: ReservationPickupMethodSchema,
})

export type Reservation = z.infer<typeof ReservationSchema>
export type CreateReservation = z.infer<typeof CreateReservationSchema>
