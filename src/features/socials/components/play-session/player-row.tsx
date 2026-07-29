"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PlayerRowUser {
  name?: string | null
  fullName?: string | null
  avatar?: string | null
}

export const PlayerRow = ({
  user,
  alignRight = false,
}: {
  user?: PlayerRowUser | null
  alignRight?: boolean
}) => {
  const displayName = user?.name || user?.fullName || "Unknown Player"

  return (
    <div
      className={`flex items-center gap-2 ${alignRight ? "justify-end" : ""}`}
    >
      {!alignRight && (
        <Avatar className="size-8">
          <AvatarImage src={user?.avatar ?? undefined} alt={displayName} />
          <AvatarFallback>
            {displayName.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <span className="truncate text-sm">{displayName}</span>
      {alignRight && (
        <Avatar className="size-8">
          <AvatarImage src={user?.avatar ?? undefined} alt={displayName} />
          <AvatarFallback>
            {displayName.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
