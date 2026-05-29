import { ReservationSchema, type CreateReservation, type Reservation } from '@sdilej-urodu/shared'
import client from './client'

export async function createReservation(body: CreateReservation): Promise<Reservation> {
  const { data } = await client.post('/reservations', body)
  return ReservationSchema.parse(data)
}
