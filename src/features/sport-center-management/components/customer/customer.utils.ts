import type { CustomerSummary } from "@/features/sport-center-management/types/customer"

export function formatDateTimeLong(timestamp?: string | null) {
  if (!timestamp) return "—"

  const parsed = new Date(timestamp)
  if (Number.isNaN(parsed.getTime())) return "—"

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)
}

export function formatVisitBreakdown(
  summary: CustomerSummary,
  labels: {
    completed: string
    pending: string
    cancelled: string
  }
) {
  return [
    `${labels.completed}: ${summary.completedVisitCount}`,
    `${labels.pending}: ${summary.pendingVisitCount}`,
    `${labels.cancelled}: ${summary.cancelledVisitCount}`,
  ]
}
