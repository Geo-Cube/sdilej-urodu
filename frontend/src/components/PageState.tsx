import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

export function PageSpinner() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-green-700" />
    </div>
  )
}

export function PageError({ message }: { message: string }) {
  return <p className="text-center text-red-500 py-20">{message}</p>
}

export function PageHeading({ children }: { children: ReactNode }) {
  return <h1 className="text-2xl font-semibold text-gray-900 mb-6">{children}</h1>
}
