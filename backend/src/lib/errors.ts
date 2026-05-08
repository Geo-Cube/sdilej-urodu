/**
 * Chyba s HTTP stavovým kódem — vyhazuje se v service vrstvě
 * a Fastify error handler ji přepošle klientovi se správným statusem.
 *
 * @param message - Lidsky čitelný popis chyby
 * @param statusCode - HTTP stavový kód (např. 400, 404)
 */
export class HttpError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message)
    this.name = 'HttpError'
  }
}
