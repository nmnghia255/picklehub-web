"use client"

import { LockKeyhole } from "lucide-react"
import React from "react"

import { Badge } from "@/components/ui/badge"

export default function SocialHero({ isPrivate }: { isPrivate: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-sky-500 via-blue-600 to-violet-600 shadow-sm">
      <div className="flex h-72 items-center justify-center">
        <span className="text-7xl drop-shadow-lg">🏓</span>
      </div>
      {isPrivate && (
        <Badge
          className="absolute top-4 right-4 gap-1 border-white/20 bg-black/60 text-white backdrop-blur"
          variant="outline"
        >
          <LockKeyhole className="size-3.5" />
          Private Event
        </Badge>
      )}
    </div>
  )
}
