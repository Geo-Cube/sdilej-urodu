import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { CreateOfferPage } from '@/pages/CreateOfferPage'
import { OfferDetailPage } from '@/pages/OfferDetailPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/offers/new', element: <CreateOfferPage /> },
      { path: '/offers/:id', element: <OfferDetailPage /> },
    ],
  },
])
