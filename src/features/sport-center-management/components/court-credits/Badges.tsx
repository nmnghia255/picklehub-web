"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type {
  CancellationReason,
  CreditStatus,
} from "../../credit-management/court-credits-data"

export function CreditStatusBadge({
  status,
  className,
}: {
  status: CreditStatus
  className?: string
}) {
  const styles: Record<CreditStatus, string> = {
    ACTIVE:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    PARTIALLY_USED:
      "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    USED: "border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-300",
    EXPIRED:
      "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  }

  const labels: Record<CreditStatus, string> = {
    ACTIVE: "Active",
    PARTIALLY_USED: "Partially used",
    USED: "Used",
    EXPIRED: "Expired",
  }

  return (
    <Badge
      className={cn(
        "border px-2.5 py-1 font-medium",
        styles[status],
        className
      )}
      variant="outline"
    >
      {labels[status]}
    </Badge>
  )
}

export function ReasonBadge({ reason }: { reason: CancellationReason }) {
  const labels: Record<CancellationReason, string> = {
    CUSTOMER_CANCELLED: "Customer Cancelled",
    OWNER_CANCELLED: "Owner Cancelled",
    WEATHER: "Weather",
    MAINTENANCE: "Maintenance",
    OTHER: "Other",
  }

  return <Badge variant="secondary">{labels[reason]}</Badge>
}
