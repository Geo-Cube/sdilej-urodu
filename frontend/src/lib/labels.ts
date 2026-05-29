import type { z } from 'zod'
import type { PickupMethodSchema, UnitSchema } from '@sdilej-urodu/shared'

type Unit = z.infer<typeof UnitSchema>
type PickupMethod = z.infer<typeof PickupMethodSchema>
type ReservationPickupMethod = Exclude<PickupMethod, 'BOTH'>

export const unitLabel: Record<Unit, string> = {
  KG: 'kg',
  G: 'g',
  KS: 'ks',
}

export const pickupLabel: Record<PickupMethod, string> = {
  PERSONAL: 'Osobní předání',
  NON_CONTACT: 'Bezkontaktní stánek',
  BOTH: 'Osobní i bezkontaktní',
}

export const unitOptions = Object.entries(unitLabel) as Array<[Unit, string]>
export const pickupOptions = Object.entries(pickupLabel) as Array<[PickupMethod, string]>
export const reservationPickupOptions = pickupOptions.filter(
  ([value]) => value !== 'BOTH',
) as Array<[ReservationPickupMethod, string]>
