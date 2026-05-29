import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/Layout'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        lazy: async () => {
          const { HomePage } = await import('@/pages/HomePage')
          return { Component: HomePage }
        },
      },
      {
        path: '/offers/new',
        lazy: async () => {
          const { CreateOfferPage } = await import('@/pages/CreateOfferPage')
          return { Component: CreateOfferPage }
        },
      },
      {
        path: '/offers/:id',
        lazy: async () => {
          const { OfferDetailPage } = await import('@/pages/OfferDetailPage')
          return { Component: OfferDetailPage }
        },
      },
      {
        path: '*',
        lazy: async () => {
          const { NotFoundPage } = await import('@/pages/NotFoundPage')
          return { Component: NotFoundPage }
        },
      },
    ],
  },
])
