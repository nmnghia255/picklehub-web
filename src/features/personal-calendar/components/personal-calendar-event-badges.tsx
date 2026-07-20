import type { TFunction } from "i18next"

import { Badge } from "@/components/ui/badge"

import type { CalendarActivity } from "../api/calendar-client"

const statusLabelKeys: Record<CalendarActivity["status"], string> = {
  COMPLETED: "completed",
  LIVE: "live",
  UPCOMING: "upcoming",
  PENDING_CONFIRM: "pendingConfirm",
  CANCELLED: "cancelled",
}

const typeLabelKeys: Record<CalendarActivity["type"], string> = {
  SOCIAL_SESSION: "socialSession",
  BOOKING: "booking",
  TOURNAMENT: "tournament",
  MATCH_PRACTICE: "matchPractice",
  MATCH_TOURNAMENT: "matchTournament",
}

export function CalendarActivityStatusBadge({
  status,
  t,
}: {
  status: CalendarActivity["status"]
  t: TFunction<"common">
}) {
  const labelKey = statusLabelKeys[status]

  switch (status) {
    case "COMPLETED":
      return (
        <Badge className="border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {t(`calendar.status.${labelKey}`)}
        </Badge>
      )
    case "LIVE":
      return (
        <Badge className="animate-pulse border border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {t(`calendar.status.${labelKey}`)}
        </Badge>
      )
    case "UPCOMING":
      return (
        <Badge className="border border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
          {t(`calendar.status.${labelKey}`)}
        </Badge>
      )
    case "PENDING_CONFIRM":
      return (
        <Badge className="border border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          {t(`calendar.status.${labelKey}`)}
        </Badge>
      )
    case "CANCELLED":
      return (
        <Badge className="border border-red-200 bg-red-100 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          {t(`calendar.status.${labelKey}`)}
        </Badge>
      )
  }
}

export function CalendarActivityTypeBadge({
  type,
  t,
}: {
  type: CalendarActivity["type"]
  t: TFunction<"common">
}) {
  const labelKey = typeLabelKeys[type]

  switch (type) {
    case "SOCIAL_SESSION":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-orange-200 bg-orange-50 font-normal text-orange-700 dark:border-orange-900/30 dark:bg-orange-950/20 dark:text-orange-400"
        >
          <span>🏓</span> {t(`calendar.types.${labelKey}`)}
        </Badge>
      )
    case "BOOKING":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-blue-200 bg-blue-50 font-normal text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400"
        >
          <span>📅</span> {t(`calendar.types.${labelKey}`)}
        </Badge>
      )
    case "TOURNAMENT":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-purple-200 bg-purple-50 font-normal text-purple-700 dark:border-purple-900/30 dark:bg-purple-950/20 dark:text-purple-400"
        >
          <span>🏆</span> {t(`calendar.types.${labelKey}`)}
        </Badge>
      )
    case "MATCH_PRACTICE":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-pink-200 bg-pink-50 font-normal text-pink-700 dark:border-pink-900/30 dark:bg-pink-950/20 dark:text-pink-400"
        >
          <span>⚔️</span> {t(`calendar.types.${labelKey}`)}
        </Badge>
      )
    case "MATCH_TOURNAMENT":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-200 bg-amber-50 font-normal text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400"
        >
          <span>🏅</span> {t(`calendar.types.${labelKey}`)}
        </Badge>
      )
  }
}
