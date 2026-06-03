"use client"

import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function PlayerRow({
  user,
  alignRight = false,
}: {
  user: { name: string; avatar?: string | null }
  alignRight?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 ${alignRight ? "justify-end" : ""}`}
    >
      {!alignRight && (
        <Avatar className="size-8">
          <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
          <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
      )}
      <span className="truncate text-sm">{user.name}</span>
      {alignRight && (
        <Avatar className="size-8">
          <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
          <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
