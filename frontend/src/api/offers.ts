import {
  GetOfferResponseSchema,
  GetOffersResponseSchema,
  OfferSchema,
  type GetOfferResponse,
  type GetOffersResponse,
  type CreateOffer,
  type Offer,
} from '@sdilej-urodu/shared'
import client from './client'

export async function fetchOffers(): Promise<GetOffersResponse> {
  const { data } = await client.get('/offers')
  return GetOffersResponseSchema.parse(data)
}

export async function fetchOffer(id: number): Promise<GetOfferResponse> {
  const { data } = await client.get(`/offers/${id}`)
  return GetOfferResponseSchema.parse(data)
}

export async function createOffer(body: CreateOffer): Promise<Offer> {
  const { data } = await client.post('/offers', body)
  return OfferSchema.parse(data)
}
