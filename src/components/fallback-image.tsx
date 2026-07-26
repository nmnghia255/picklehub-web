"use client"

import type { ImgHTMLAttributes } from "react"

const DEFAULT_IMAGE =
  "https://cdn.mos.cms.futurecdn.net/Spgo5rGoUCJC4ThbZx8fAh-1920-80.jpg"

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
