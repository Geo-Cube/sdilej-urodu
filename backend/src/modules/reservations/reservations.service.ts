import prisma from '../../lib/prisma.js'
import { HttpError } from '../../lib/errors.js'
import type { CreateReservation } from '@sdilej-urodu/shared'

/**
 * Vytvoří rezervaci v rámci transakce:
 * 1. Ověří existenci a stav nabídky (musí být ACTIVE).
 * 2. Zkontroluje dostatek množství a případný limit `maxQuantity`.
 * 3. Ověří kompatibilitu způsobu vyzvednutí.
 * 4. Sníží `availableQuantity`; při dosažení nuly přepne stav na SOLD_OUT.
 *
 * @throws {HttpError} 404 — nabídka neexistuje nebo není aktivní
 * @throws {HttpError} 400 — nedostatek množství, překročení limitu, nebo nekompatibilní způsob vyzvednutí
 */
export async function createReservation(data: CreateReservation) {
  return prisma.$transaction(async (tx) => {
    const offer = await tx.offer.findFirst({
      where: { id: data.offerId, status: 'ACTIVE' },
    })

    if (!offer) {
      throw new HttpError('Nabídka nebyla nalezena nebo není aktivní', 404)
    }

    const remainder = Math.round((data.reservedQuantity % offer.stepQuantity) * 1e10) / 1e10
    if (remainder !== 0) {
      throw new HttpError(
        `Rezervované množství musí být násobek kroku ${offer.stepQuantity}`,
        400,
      )
    }

    if (offer.availableQuantity < data.reservedQuantity) {
      throw new HttpError(
        `Nedostatek množství. Dostupné: ${offer.availableQuantity}, požadované: ${data.reservedQuantity}`,
        400,
      )
    }

    if (offer.maxQuantity !== null && data.reservedQuantity > offer.maxQuantity) {
      throw new HttpError(
        `Překročeno maximální množství na rezervaci: ${offer.maxQuantity}`,
        400,
      )
    }

    // BOTH znamená, že nabídka akceptuje oba způsoby vyzvednutí
    if (offer.pickupMethod !== 'BOTH' && offer.pickupMethod !== data.selectedPickupMethod) {
      throw new HttpError(
        `Nabídka podporuje pouze způsob vyzvednutí: ${offer.pickupMethod}`,
        400,
      )
    }

    const newQuantity = offer.availableQuantity - data.reservedQuantity

    const reservation = await tx.reservation.create({
      data: {
        offerId: data.offerId,
        reserverName: data.reserverName,
        reserverEmail: data.reserverEmail,
        reserverPhone: data.reserverPhone,
        reservedQuantity: data.reservedQuantity,
        selectedPickupMethod: data.selectedPickupMethod,
      },
    })

    await tx.offer.update({
      where: { id: data.offerId },
      data: {
        availableQuantity: newQuantity,
        // Automaticky označí nabídku jako SOLD_OUT při vyčerpání zásob
        ...(newQuantity <= 0 && { status: 'SOLD_OUT' }),
      },
    })

    return reservation
  })
}
