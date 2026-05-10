import prisma from '../../lib/prisma.js'
import type { CreateOffer } from '@sdilej-urodu/shared'

/**
 * Vrátí všechny nabídky se stavem ACTIVE.
 *
 * @returns Pole aktivních nabídek
 */
export async function getOffers() {
  return prisma.offer.findMany({
    where: { status: 'ACTIVE' },
  })
}

/**
 * Vytvoří novou nabídku. Volitelná pole (`description`, `maxQuantity`, `photoUrl`)
 * jsou uložena jako `null` pokud nejsou poskytnutá.
 *
 * @param data - Validovaná vstupní data z `CreateOfferSchema`
 * @returns Nově vytvořená nabídka
 */
export async function createOffer(data: CreateOffer) {
  const { description = null, maxQuantity = null, photoUrl = null, phone = null, ...rest } = data
  return prisma.offer.create({
    data: { ...rest, description, maxQuantity, photoUrl, phone },
  })
}

/**
 * Vrátí nabídku včetně všech jejích rezervací.
 *
 * @param id - ID nabídky
 * @returns Nabídka s polem rezervací, nebo `null` pokud neexistuje
 */
export async function getOfferById(id: number) {
  return prisma.offer.findUnique({
    where: { id },
    include: { reservations: true },
  })
}
