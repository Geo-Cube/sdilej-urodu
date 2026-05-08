import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import autoload from '@fastify/autoload'
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from 'fastify-type-provider-zod'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

/**
 * Sestaví a nakonfiguruje Fastify aplikaci.
 *
 * Vrací instanci připravenou k naslouchání (nebo k `app.inject()` v testech)
 * bez volání `app.listen()` — to záměrně ponechávám na `server.ts`.
 *
 * @returns Nakonfigurovaná instance Fastify s ZodTypeProvider
 */
export async function buildApp() {
  const app = Fastify({
    logger: true,
    routerOptions: { ignoreTrailingSlash: true },
    // ZodTypeProvider zajistí typovou bezpečnost mezi Zod schématy a handlery
  }).withTypeProvider<ZodTypeProvider>()

  // Zod jako validátor vstupů i serializátor výstupů místo výchozího JSON Schema
  app.setSerializerCompiler(serializerCompiler)
  app.setValidatorCompiler(validatorCompiler)

  await app.register(cors, { origin: true })

  // OpenAPI dokumentace dostupná na /api/docs
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Sdílej úrodu API',
        version: '1.0.0',
      },
    },
    // jsonSchemaTransform převede Zod schémata do formátu srozumitelného pro Swagger
    transform: jsonSchemaTransform,
  })

  await app.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
      operationsSorter: 'method',
    },
  })

  // Automaticky načte všechny route pluginy ze složky modules a přidá prefix /api
  await app.register(autoload, {
    dir: path.join(path.dirname(fileURLToPath(import.meta.url)), 'modules'),
    options: { prefix: '/api' },
  })

  app.setErrorHandler((error, _request, reply) => {
    // Chyby validace vstupních dat (Zod) → 400 s detailem každé issue
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation error',
        issues: error.validation,
      })
    }
    // Serializace odpovědi selhala — výstupní data neodpovídají schématu
    if (isResponseSerializationError(error)) {
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Response serialization failed',
        cause: error.cause.issues,
      })
    }
    // HttpError a ostatní chyby — Fastify doplní statusCode automaticky
    return reply.send(error)
  })

  return app
}
