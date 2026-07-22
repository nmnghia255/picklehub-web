"use client"

import { useScoreTranslation } from "@/i18n/use-score-translation"
import { cn } from "@/lib/utils"

import { TEAM_COLOR } from "../constants/team-constants"
import type { Team } from "../stores/use-score-store"

type CourtSlotProps = {
  team: Team
  label: string
  playerName: string
  isServing: boolean
  isReceiving?: boolean
}

export function CourtSlot({
  team,
  label,
  playerName,
  isServing,
  isReceiving = false,
}: CourtSlotProps) {
  const { t } = useScoreTranslation()
  const teamColor = TEAM_COLOR[team]

  if (!playerName) {
    return <div className="min-w-30 p-4" />
  }

  const badgeColor =
    team === "A"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"

  return (
    <div
      data-team={team}
      className="group/player relative flex min-w-32 flex-col items-center gap-2 rounded-xl border border-transparent bg-white/95 p-3 shadow-sm ring-2 ring-transparent transition-all dark:bg-zinc-900/95"
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-full text-sm font-bold shadow-xs",
          teamColor.chip
        )}
      >
        {label}
      </div>

      <span className="line-clamp-2 flex min-h-8 max-w-[120px] items-center justify-center px-1 text-center text-[11px] font-semibold wrap-break-word text-foreground">
        {playerName}
      </span>

      <div className="mt-1 flex gap-1">
        {isServing && (
          <span
            className={cn(
              "rounded-sm px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase",
              badgeColor
            )}
          >
            {t("tracker.serving", { defaultValue: "Giao" })}
          </span>
        )}
        {isReceiving && (
          <span
            className={cn(
              "rounded-sm px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase",
              badgeColor
            )}
          >
            {t("tracker.receiving", { defaultValue: "Nhận" })}
          </span>
        )}
      </div>

      {isServing && (
        <span
          className={cn(
            "absolute top-1/2 inline-block size-3 shrink-0 -translate-y-1/2 animate-pulse rounded-full",
            "group-data-[team=A]/player:-right-5",
            "group-data-[team=B]/player:-left-5",
            "bg-emerald-500"
          )}
          aria-hidden
        />
      )}
    </div>
  )
}
