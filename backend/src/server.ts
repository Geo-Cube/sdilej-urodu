import { buildApp } from './app.js'
import prisma from './lib/prisma.js'

const PORT = Number(process.env['PORT']) || 3000
const HOST = process.env['HOST'] ?? '0.0.0.0'

async function start() {
  const app = await buildApp()

  const shutdown = async () => {
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  try {
    await app.listen({ port: PORT, host: HOST })
  } catch (err) {
    app.log.error(err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

start()
