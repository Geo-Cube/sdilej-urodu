import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { CreateReservationSchema, ReservationSchema } from '@sdilej-urodu/shared'
import { createReservation } from './reservations.service.js'

const plugin: FastifyPluginAsyncZod = async (fastify) => {
  /** POST /api/reservations — rezervace množství z nabídky, vrátí 201 s vytvořenou rezervací */
  fastify.post('/', {
    schema: {
      tags: ['Reservations'],
      summary: 'Vytvoření rezervace',
      description: 'Rezervuje množství z nabídky. Pokud po rezervaci zbyde nula, nabídka se automaticky označí jako SOLD_OUT.',
      body: CreateReservationSchema,
      response: { 201: ReservationSchema },
    },
  }, async (request, reply) => {
    const reservation = await createReservation(request.body)
    return reply.status(201).send(reservation)
  })
}

export default plugin
