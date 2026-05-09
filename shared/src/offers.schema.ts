import { z } from 'zod'
import { UnitSchema, OfferStatusSchema, PickupMethodSchema, phoneSchema } from './enums.schema.js'
import { ReservationSchema } from './reservations.schema.js'

export const OfferSchema = z.object({
  id: z.number().int(),
  cropName: z.string(),
  description: z.string().nullable(),
  availableQuantity: z.number(),
  stepQuantity: z.number(),
  maxQuantity: z.number().nullable(),
  price: z.number(),
  isFree: z.boolean(),
  unit: UnitSchema,
  farmerName: z.string(),
  email: z.email(),
  phone: z.string().nullable(),
  street: z.string(),
  city: z.string(),
  zipCode: z.string(),
  photoUrl: z.string().nullable(),
  status: OfferStatusSchema,
  pickupMethod: PickupMethodSchema,
  pickupInstructions: z.string(),
})

export const GetOffersResponseSchema = z.array(OfferSchema)

export const GetOfferParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const GetOfferResponseSchema = OfferSchema.extend({
  reservations: z.array(ReservationSchema),
})

export const CreateOfferSchema = z.object({
  cropName: z.string().min(1),
  description: z.string().nullable().optional(),
  availableQuantity: z.number().positive(),
  stepQuantity: z.number().positive(),
  maxQuantity: z.number().positive().nullable().optional(),
  price: z.number(),
  isFree: z.boolean().optional(),
  unit: UnitSchema,
  farmerName: z.string().min(1),
  email: z.email(),
  phone: phoneSchema.optional().nullable(),
  street: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  photoUrl: z.url().nullable().optional(),
  pickupMethod: PickupMethodSchema,
  pickupInstructions: z.string().min(1),
})
  .refine(
    (val) => (val.isFree ?? false) || val.price > 0,
    { message: 'Cena musí být kladná', path: ['price'] },
  )
  .refine(
    (val) => val.stepQuantity <= val.availableQuantity,
    { message: 'Krok musí být menší nebo roven dostupnému množství', path: ['stepQuantity'] },
  )
  .refine(
    (val) => val.maxQuantity == null || val.maxQuantity <= val.availableQuantity,
    { message: 'Maximální množství na rezervaci nesmí překročit dostupné množství', path: ['maxQuantity'] },
  )
  .refine(
    (val) => Math.round((val.availableQuantity % val.stepQuantity) * 1e10) / 1e10 === 0,
    { message: 'Dostupné množství musí být dělitelné krokem', path: ['availableQuantity'] },
  )
  .refine(
    (val) => val.maxQuantity == null || Math.round((val.maxQuantity % val.stepQuantity) * 1e10) / 1e10 === 0,
    { message: 'Maximální množství musí být dělitelné krokem', path: ['maxQuantity'] },
  )
  .transform((val) => ({
    ...val,
    price: (val.isFree ?? false) ? 0 : val.price,
    isFree: val.isFree ?? false,
  }))

export type Offer = z.infer<typeof OfferSchema>
export type GetOffersResponse = z.infer<typeof GetOffersResponseSchema>
export type GetOfferParams = z.infer<typeof GetOfferParamsSchema>
export type GetOfferResponse = z.infer<typeof GetOfferResponseSchema>
export type CreateOffer = z.infer<typeof CreateOfferSchema>
