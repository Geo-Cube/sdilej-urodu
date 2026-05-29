import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.js'
import prisma from '../src/lib/prisma.js'

let app: FastifyInstance

beforeAll(async () => {
  app = await buildApp()
})

afterAll(async () => {
  await app.close()
  await prisma.$disconnect()
})

const baseOffer = {
  cropName: 'Testovací plodina',
  availableQuantity: 10,
  stepQuantity: 1,
  price: 50,
  unit: 'KG',
  farmerName: 'Test Farmer',
  email: 'test@example.com',
  phone: '+420777123456',
  street: 'Testovací 1',
  city: 'Praha',
  zipCode: '100 00',
  pickupMethod: 'PERSONAL',
  pickupInstructions: 'Zavolejte předem',
} as const

const baseReservation = {
  reserverName: 'Test Reserver',
  reserverEmail: 'reserver@example.com',
  reserverPhone: '+420777999888',
  selectedPickupMethod: 'PERSONAL',
} as const

async function createOffer(overrides: Record<string, unknown> = {}) {
  const res = await app.inject({
    method: 'POST',
    url: '/api/offers',
    body: { ...baseOffer, ...overrides },
  })
  return res.json() as { id: number; availableQuantity: number; status: string; isFree: boolean; price: number }
}

// ─── POST /api/offers ──────────────────────────────────────────────────────────

describe('POST /api/offers', () => {
  it('vytvoří nabídku a vrátí 201', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/offers', body: baseOffer })

    expect(res.statusCode).toBe(201)
    const body = res.json()
    expect(body.cropName).toBe(baseOffer.cropName)
    expect(body.availableQuantity).toBe(baseOffer.availableQuantity)
    expect(body.status).toBe('ACTIVE')
    expect(body.id).toBeTypeOf('number')
  })

  it('isFree=true nastaví cenu na 0', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/offers',
      body: { ...baseOffer, isFree: true, price: 999 },
    })

    expect(res.statusCode).toBe(201)
    const body = res.json()
    expect(body.isFree).toBe(true)
    expect(body.price).toBe(0)
  })

  it('price=0 bez isFree vrátí 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/offers',
      body: { ...baseOffer, price: 0 },
    })
    expect(res.statusCode).toBe(400)
  })

  it('záporná cena bez isFree vrátí 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/offers',
      body: { ...baseOffer, price: -10 },
    })
    expect(res.statusCode).toBe(400)
  })

  it('neplatný email vrátí 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/offers',
      body: { ...baseOffer, email: 'not-an-email' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('neplatné telefonní číslo vrátí 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/offers',
      body: { ...baseOffer, phone: 'abc' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('prázdný cropName vrátí 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/offers',
      body: { ...baseOffer, cropName: '' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('chybějící povinné pole vrátí 400', async () => {
    const { cropName: _, ...withoutCropName } = baseOffer
    const res = await app.inject({
      method: 'POST',
      url: '/api/offers',
      body: withoutCropName,
    })
    expect(res.statusCode).toBe(400)
  })

  it('uloží volitelná pole description a maxQuantity', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/offers',
      body: { ...baseOffer, description: 'Popis plodiny', maxQuantity: 5 },
    })

    expect(res.statusCode).toBe(201)
    const body = res.json()
    expect(body.description).toBe('Popis plodiny')
    expect(body.maxQuantity).toBe(5)
  })

  it('vrátí 400 pokud je maxQuantity menší než stepQuantity', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/offers',
      body: { ...baseOffer, availableQuantity: 100, stepQuantity: 50, maxQuantity: 20 },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().message).toContain('Maximální množství na osobu musí být alespoň jako krok balení')
  })

  it('vrátí 400 pokud maxQuantity není násobkem stepQuantity', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/offers',
      body: { ...baseOffer, availableQuantity: 100, stepQuantity: 10, maxQuantity: 25 },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().message).toContain('Maximální množství na osobu musí být dělitelné krokem balení')
  })

  it('vrátí 400 pokud krok balení nedělí celkové množství', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/offers',
      body: { ...baseOffer, availableQuantity: 10, stepQuantity: 3 },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().message).toContain('Celkové množství musí být dělitelné krokem balení')
  })
})

// ─── GET /api/offers ───────────────────────────────────────────────────────────

describe('GET /api/offers', () => {
  it('vrátí prázdné pole pokud nejsou žádné nabídky', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/offers' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual([])
  })

  it('vrátí pole aktivních nabídek', async () => {
    await createOffer()
    await createOffer({ cropName: 'Druhá plodina' })

    const res = await app.inject({ method: 'GET', url: '/api/offers' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(2)
  })

  it('nevrátí SOLD_OUT nabídky', async () => {
    const offer = await createOffer({ availableQuantity: 2 })
    await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: offer.id, reservedQuantity: 2 },
    })

    const res = await app.inject({ method: 'GET', url: '/api/offers' })
    const ids = res.json().map((o: { id: number }) => o.id)
    expect(ids).not.toContain(offer.id)
  })
})

// ─── GET /api/offers/:id ───────────────────────────────────────────────────────

describe('GET /api/offers/:id', () => {
  it('vrátí nabídku s prázdným polem rezervací', async () => {
    const offer = await createOffer()

    const res = await app.inject({ method: 'GET', url: `/api/offers/${offer.id}` })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.id).toBe(offer.id)
    expect(Array.isArray(body.reservations)).toBe(true)
    expect(body.reservations.length).toBe(0)
  })

  it('vrátí nabídku včetně rezervací', async () => {
    const offer = await createOffer()
    await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: offer.id, reservedQuantity: 3 },
    })

    const res = await app.inject({ method: 'GET', url: `/api/offers/${offer.id}` })

    expect(res.statusCode).toBe(200)
    expect(res.json().reservations.length).toBe(1)
  })

  it('neexistující nabídka vrátí 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/offers/999999' })
    expect(res.statusCode).toBe(404)
  })
})

// ─── POST /api/reservations ────────────────────────────────────────────────────

describe('POST /api/reservations', () => {
  it('sníží availableQuantity po úspěšné rezervaci', async () => {
    const offer = await createOffer({ availableQuantity: 10 })

    const reservationRes = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: offer.id, reservedQuantity: 3 },
    })
    expect(reservationRes.statusCode).toBe(201)

    const detailRes = await app.inject({ method: 'GET', url: `/api/offers/${offer.id}` })
    expect(detailRes.json().availableQuantity).toBe(7)
  })

  it('vrátí 400 při nedostatku množství a nezmění stav', async () => {
    const offer = await createOffer({ availableQuantity: 5 })

    const reservationRes = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: offer.id, reservedQuantity: 10 },
    })
    expect(reservationRes.statusCode).toBe(400)

    const detailRes = await app.inject({ method: 'GET', url: `/api/offers/${offer.id}` })
    expect(detailRes.json().availableQuantity).toBe(5)
  })

  it('označí nabídku jako SOLD_OUT při vyčerpání množství', async () => {
    const offer = await createOffer({ availableQuantity: 3 })

    const reservationRes = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: offer.id, reservedQuantity: 3 },
    })
    expect(reservationRes.statusCode).toBe(201)

    const detailRes = await app.inject({ method: 'GET', url: `/api/offers/${offer.id}` })
    expect(detailRes.json().status).toBe('SOLD_OUT')
    expect(detailRes.json().availableQuantity).toBe(0)
  })

  it('vrátí 400 při překročení maxQuantity', async () => {
    const offer = await createOffer({ availableQuantity: 20, maxQuantity: 5 })

    const res = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: offer.id, reservedQuantity: 6 },
    })
    expect(res.statusCode).toBe(400)

    const detailRes = await app.inject({ method: 'GET', url: `/api/offers/${offer.id}` })
    expect(detailRes.json().availableQuantity).toBe(20)
  })

  it('vrátí 400 při nekompatibilním způsobu vyzvednutí', async () => {
    const offer = await createOffer({ pickupMethod: 'PERSONAL' })

    const res = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: offer.id, reservedQuantity: 1, selectedPickupMethod: 'NON_CONTACT' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('nabídka BOTH akceptuje oba způsoby vyzvednutí', async () => {
    const offer = await createOffer({ pickupMethod: 'BOTH' })

    const personalRes = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: offer.id, reservedQuantity: 1, selectedPickupMethod: 'PERSONAL' },
    })
    expect(personalRes.statusCode).toBe(201)

    const nonContactRes = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: offer.id, reservedQuantity: 1, selectedPickupMethod: 'NON_CONTACT' },
    })
    expect(nonContactRes.statusCode).toBe(201)
  })

  it('vrátí 404 pro neexistující nabídku', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: 999999, reservedQuantity: 1 },
    })
    expect(res.statusCode).toBe(404)
  })

  it('vrátí 404 pro SOLD_OUT nabídku', async () => {
    const offer = await createOffer({ availableQuantity: 1 })
    await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: offer.id, reservedQuantity: 1 },
    })

    const res = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: offer.id, reservedQuantity: 1 },
    })
    expect(res.statusCode).toBe(404)
  })

  it('neplatný reserverEmail vrátí 400', async () => {
    const offer = await createOffer()

    const res = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: offer.id, reservedQuantity: 1, reserverEmail: 'neplatny' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('neplatné reserverPhone vrátí 400', async () => {
    const offer = await createOffer()

    const res = await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: offer.id, reservedQuantity: 1, reserverPhone: 'abc' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('rezervace se objeví v detailu nabídky', async () => {
    const offer = await createOffer()

    await app.inject({
      method: 'POST',
      url: '/api/reservations',
      body: { ...baseReservation, offerId: offer.id, reservedQuantity: 2 },
    })

    const detailRes = await app.inject({ method: 'GET', url: `/api/offers/${offer.id}` })
    const reservations = detailRes.json().reservations
    expect(reservations.length).toBe(1)
    expect(reservations[0].reservedQuantity).toBe(2)
    expect(reservations[0].reserverName).toBe(baseReservation.reserverName)
  })
})
