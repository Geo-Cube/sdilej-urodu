import { Leaf } from 'lucide-react'

type Props = {
  photoUrl: string | null
  alt: string
  iconClassName?: string
}

export function OfferImage({ photoUrl, alt, iconClassName = 'h-12 w-12' }: Props) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={alt}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    )
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-700">
      <Leaf className={iconClassName} />
    </div>
  )
}
