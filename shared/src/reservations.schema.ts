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
  createdAt: z.date(),
})

export const CreateReservationSchema = z.object({
  offerId: z.number().int().positive(),
  reserverName: z.string().min(1),
  reserverEmail: z.email(),
  reserverPhone: phoneSchema,
  reservedQuantity: z.number().positive(),
  selectedPickupMethod: ReservationPickupMethodSchema,
})

export type Reservation = z.infer<typeof ReservationSchema>
export type CreateReservation = z.infer<typeof CreateReservationSchema>
