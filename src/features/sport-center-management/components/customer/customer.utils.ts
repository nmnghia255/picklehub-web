import type { CustomerSummary } from "@/features/sport-center-management/types/customer"

export function formatDateTimeLong(timestamp?: string | null) {
  if (!timestamp) return "—"

  const parsed = new Date(timestamp)
  if (Number.isNaN(parsed.getTime())) return "—"

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
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
  return `${labels.completed} ${summary.completedVisitCount} · ${labels.pending} ${summary.pendingVisitCount} · ${labels.cancelled} ${summary.cancelledVisitCount}`
}
