"use client"

import { cn } from "@/lib/utils"

import { TEAM_COLOR } from "../constants/team-constants"
import type { Team } from "../stores/use-score-store"

type CourtSlotProps = {
  team: Team
  label: string
  playerName: string
  isServing: boolean
}

export function CourtSlot({
  team,
  label,
  playerName,
  isServing,
}: CourtSlotProps) {
  const teamColor = TEAM_COLOR[team]

  if (!playerName) {
    return <div className="min-w-30 p-4" />
  }

  return (
    <div
      data-team={team}
      className={cn(
        "group/player relative flex min-w-30 flex-col items-center gap-2 p-4 ring-2 ring-transparent transition-all",
        isServing ? cn("bg-card", teamColor.servingRing) : null
      )}
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full text-lg font-semibold",
          teamColor.chip
        )}
      >
        {label}
      </div>

      <span className="flex min-h-10 max-w-[140px] items-center justify-center px-1 text-center text-xs font-semibold wrap-break-word text-foreground">
        {playerName}
      </span>

      {isServing && (
        <span
          className={cn(
            "absolute top-1/2 inline-block size-3 shrink-0 -translate-y-1/2 animate-pulse rounded-full",
            "group-data-[team=A]/player:-right-5",
            "group-data-[team=B]/player:-left-5",
            teamColor.servingDot
          )}
          aria-hidden
        />
      )}
    </div>
  )
}
