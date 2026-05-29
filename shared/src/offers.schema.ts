import { z } from 'zod'
import { UnitSchema, OfferStatusSchema, PickupMethodSchema, phoneSchema } from './enums.schema.js'
import { ReservationSchema } from './reservations.schema.js'

export const quantityValidationMessages = {
  stepTooHigh: 'Krok balení nesmí být větší než celkové množství',
  maxTooHigh: 'Maximální množství na osobu nesmí překročit celkové množství',
  maxTooLow: 'Maximální množství na osobu musí být alespoň jako krok balení',
  availableNotMultiple: 'Celkové množství musí být dělitelné krokem balení',
  maxNotMultiple: 'Maximální množství na osobu musí být dělitelné krokem balení',
} as const

export type OfferQuantityRelationField = 'availableQuantity' | 'stepQuantity' | 'maxQuantity'
export type OfferQuantityRelationErrors = Partial<Record<OfferQuantityRelationField, string>>

export function isMultipleOfStep(value: number, step: number) {
  return Math.round((value % step) * 1e10) / 1e10 === 0
}

export function getOfferQuantityRelationErrors(input: {
  availableQuantity: number
  stepQuantity: number
  maxQuantity?: number | null | undefined
}): OfferQuantityRelationErrors {
  const errors: OfferQuantityRelationErrors = {}

  if (input.stepQuantity > input.availableQuantity) {
    errors.stepQuantity = quantityValidationMessages.stepTooHigh
    return errors
  }

  if (!isMultipleOfStep(input.availableQuantity, input.stepQuantity)) {
    errors.stepQuantity = quantityValidationMessages.availableNotMultiple
  }

  if (input.maxQuantity == null) {
    return errors
  }

  if (input.maxQuantity > input.availableQuantity) {
    errors.maxQuantity = quantityValidationMessages.maxTooHigh
    return errors
  }

  if (input.maxQuantity < input.stepQuantity) {
    errors.maxQuantity = quantityValidationMessages.maxTooLow
    return errors
  }

  if (!isMultipleOfStep(input.maxQuantity, input.stepQuantity)) {
    errors.maxQuantity = quantityValidationMessages.maxNotMultiple
  }

  return errors
}

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
  id: z.coerce
    .number({ error: 'Neplatné ID nabídky' })
    .int('ID nabídky musí být celé číslo')
    .positive('ID nabídky musí být kladné číslo'),
})

export const GetOfferResponseSchema = OfferSchema.extend({
  reservations: z.array(ReservationSchema),
})

export const CreateOfferSchema = z.object({
  cropName: z.string({ error: 'Zadejte název plodiny' }).min(1, 'Zadejte název plodiny'),
  description: z.string().nullable().optional(),
  availableQuantity: z
    .number({ error: 'Zadejte celkové množství' })
    .positive('Celkové množství musí být větší než 0'),
  stepQuantity: z
    .number({ error: 'Zadejte krok balení' })
    .positive('Krok balení musí být větší než 0'),
  maxQuantity: z
    .number({ error: 'Zadejte maximální množství jako číslo' })
    .positive('Maximální množství musí být větší než 0')
    .nullable()
    .optional(),
  price: z.number({ error: 'Zadejte cenu' }),
  isFree: z.boolean().optional(),
  unit: UnitSchema,
  farmerName: z.string({ error: 'Zadejte jméno pěstitele' }).min(1, 'Zadejte jméno pěstitele'),
  email: z.email({ error: 'Zadejte platný email' }),
  phone: phoneSchema.optional().nullable(),
  street: z.string({ error: 'Zadejte ulici' }).min(1, 'Zadejte ulici'),
  city: z.string({ error: 'Zadejte město' }).min(1, 'Zadejte město'),
  zipCode: z.string({ error: 'Zadejte PSČ' }).min(1, 'Zadejte PSČ'),
  photoUrl: z.url({ error: 'Zadejte platnou URL fotografii' }).nullable().optional(),
  pickupMethod: PickupMethodSchema,
  pickupInstructions: z
    .string({ error: 'Zadejte instrukce k vyzvednutí' })
    .min(1, 'Zadejte instrukce k vyzvednutí'),
})
  .superRefine((val, ctx) => {
    const errors = getOfferQuantityRelationErrors(val)

    for (const [field, message] of Object.entries(errors)) {
      ctx.addIssue({ code: 'custom', message, path: [field] })
    }
  })
  .refine(
    (val) => (val.isFree ?? false) || val.price > 0,
    { message: 'Cena musí být větší než 0', path: ['price'] },
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
