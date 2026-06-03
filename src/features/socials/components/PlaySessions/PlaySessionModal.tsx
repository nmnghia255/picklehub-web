"use client"

import React from "react"

import type { PlaySession } from "@/features/socials/types"

export function PlaySessionModal({
  open,
  onClose,
  session,
  socialId,
}: {
  open: boolean
  onClose: () => void
  session?: PlaySession | null
  socialId?: string
}) {
  if (!open) return null
  return (
    <div aria-hidden={!open}>
      {/* Minimal stub modal used for build; real implementation lives elsewhere */}
      <div />
    </div>
  )
}

export default PlaySessionModal
