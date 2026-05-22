"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { ReservationStatus } from "../../../../app/(protected)/sport-center-management/reservation-management/mock-data"

interface ReservationStatusBadgeProps {
  status: ReservationStatus
  className?: string
}

const statusClasses: Record<ReservationStatus, string> = {
  HOLDING: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  AWAITING_PAYMENT:
    "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  CONFIRMED:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  EXPIRED:
    "border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-300",
  CANCELLED:
    "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
}

const statusLabels: Record<ReservationStatus, string> = {
  HOLDING: "Holding",
  AWAITING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
}

export function ReservationStatusBadge({
  status,
  className,
}: ReservationStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "border px-2.5 py-1 font-medium",
        statusClasses[status],
        className
      )}
      variant="outline"
    >
      {statusLabels[status]}
    </Badge>
  )
}
