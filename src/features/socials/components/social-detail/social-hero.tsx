"use client"

import { LockKeyhole } from "lucide-react"
import Image from "next/image"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

export default function SocialHero({ isPrivate }: { isPrivate: boolean }) {
  const { t } = useSocialsTranslation()

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-sky-500 via-blue-600 to-violet-600 shadow-sm">
      <div className="flex h-72 items-center justify-center">
        <Image
          src="/pickleball.png"
          alt={t("hero.imageAlt")}
          width={88}
          height={88}
          className="drop-shadow-lg"
        />
      </div>
      {isPrivate && (
        <Badge
          className="absolute top-4 right-4 gap-1 border-white/20 bg-black/60 text-white backdrop-blur"
          variant="outline"
        >
          <LockKeyhole className="size-3.5" />
          {t("hero.privateEvent")}
        </Badge>
      )}
    </div>
  )
}
