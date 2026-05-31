"use client"

import type { ImgHTMLAttributes } from "react"

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=240&q=80"

type FallbackImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "onError"
> & {
  src?: string
  alt: string
  fallbackSrc?: string
}

export function FallbackImage({
  src,
  alt,
  fallbackSrc = DEFAULT_IMAGE,
  ...props
}: FallbackImageProps) {
  const imageSrc = src ?? fallbackSrc

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={(event) => {
        const img = event.currentTarget as HTMLImageElement
        if (img.src !== fallbackSrc) {
          img.src = fallbackSrc
        }
      }}
      {...props}
    />
  )
}
