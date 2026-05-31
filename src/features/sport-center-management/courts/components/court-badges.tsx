"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import {
  type CourtStatus,
  getCourtStatusLabel,
  getCourtTypeLabel,
} from "../types"

const STATUS_CLASS: Record<CourtStatus, string> = {
  ACTIVE:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  MAINTENANCE:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  ARCHIVED:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
}

export function CourtStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(STATUS_CLASS[status as CourtStatus] ?? "")}
    >
      {getCourtStatusLabel(status)}
    </Badge>
  )
}

export function CourtTypeBadge({ type }: { type: string }) {
  return <Badge variant="secondary">{getCourtTypeLabel(type)}</Badge>
}
