import type { Offer } from '@sdilej-urodu/shared'
import { unitLabel } from './labels'

export function formatPrice(offer: Pick<Offer, 'isFree' | 'price' | 'unit'>) {
  return offer.isFree ? 'Zdarma' : `${offer.price} Kč/${unitLabel[offer.unit]}`
}

export function formatQuantity(value: number, unit: Offer['unit']) {
  return `${value} ${unitLabel[unit]}`
}
