import type { GetOfferResponse, GetOffersResponse, CreateOffer, Offer } from '@sdilej-urodu/shared'
import client from './client'

export async function fetchOffers(): Promise<GetOffersResponse> {
  const { data } = await client.get('/offers')
  return data
}

export async function fetchOffer(id: number): Promise<GetOfferResponse> {
  const { data } = await client.get(`/offers/${id}`)
  return data
}

export async function createOffer(body: CreateOffer): Promise<Offer> {
  const { data } = await client.post('/offers', body)
  return data
}
