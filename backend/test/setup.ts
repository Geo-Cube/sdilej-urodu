import { beforeEach } from 'vitest'
import prisma from '../src/lib/prisma.js'

beforeEach(async () => {
  await prisma.reservation.deleteMany()
  await prisma.offer.deleteMany()
})
