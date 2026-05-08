import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import {
  GetOffersResponseSchema,
  GetOfferParamsSchema,
  GetOfferResponseSchema,
  CreateOfferSchema,
  OfferSchema,
} from '@sdilej-urodu/shared'
import { HttpError } from '../../lib/errors.js'
import { getOffers, getOfferById, createOffer } from './offers.service.js'

const plugin: FastifyPluginAsyncZod = async (fastify) => {
  /** GET /api/offers — seznam všech aktivních nabídek */
  fastify.get('/', {
    schema: {
      tags: ['Offers'],
      summary: 'Načtení nabídek',
      description: 'Vrátí seznam všech aktivních nabídek.',
      response: { 200: GetOffersResponseSchema },
    },
  }, async () => {
    return getOffers()
  })

  /** GET /api/offers/:id — detail nabídky včetně rezervací */
  fastify.get('/:id', {
    schema: {
      tags: ['Offers'],
      summary: 'Získat nabídku',
      description: 'Vrátí nabídku včetně všech rezervací.',
      params: GetOfferParamsSchema,
      response: { 200: GetOfferResponseSchema },
    },
  }, async (request) => {
    const offer = await getOfferById(request.params.id)
    if (!offer) throw new HttpError('Nabídka nebyla nalezena', 404)
    return offer
  })

  /** POST /api/offers — vytvoření nové nabídky, vrátí 201 s uloženým objektem */
  fastify.post('/', {
    schema: {
      tags: ['Offers'],
      summary: 'Vytvoření nabídky',
      description: 'Vytvoří novou nabídku produktu. Stav nabídky je automaticky nastaven na ACTIVE.',
      body: CreateOfferSchema,
      response: { 201: OfferSchema },
    },
  }, async (request, reply) => {
    const offer = await createOffer(request.body)
    return reply.status(201).send(offer)
  })
}

export default plugin
