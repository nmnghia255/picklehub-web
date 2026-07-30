"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PlayerRowUser {
  name?: string | null
  fullName?: string | null
  avatar?: string | null
  avatarUrl?: string | null
  selfRating?: number | null
  duprRating?: number | null
  dupr?: {
    rating?: number | null
  } | null
}

export const PlayerRow = ({
  user,
  alignRight = false,
}: {
  user?: PlayerRowUser | null
  alignRight?: boolean
}) => {
  const displayName = user?.name || user?.fullName || "Unknown Player"
  const avatarSrc = user?.avatar || user?.avatarUrl || undefined
  const duprRating = user?.duprRating ?? user?.dupr?.rating ?? null
  const ratingText = [
    typeof user?.selfRating === "number" && !Number.isNaN(user.selfRating)
      ? `Self ${user.selfRating}`
      : null,
    typeof duprRating === "number" && !Number.isNaN(duprRating)
      ? `DUPR ${duprRating}`
      : null,
  ].filter(Boolean)

  return (
    <div
      className={`flex items-center gap-2 ${alignRight ? "justify-end" : ""}`}
    >
      {!alignRight && (
        <Avatar className="size-8">
          <AvatarImage src={avatarSrc} alt={displayName} />
          <AvatarFallback>
            {displayName.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="min-w-0">
        <div className="truncate text-sm">{displayName}</div>
        {ratingText.length > 0 && (
          <div className="truncate text-[10px] text-muted-foreground">
            {ratingText.join(" • ")}
          </div>
        )}
      </div>
      {alignRight && (
        <Avatar className="size-8">
          <AvatarImage src={avatarSrc} alt={displayName} />
          <AvatarFallback>
            {displayName.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
