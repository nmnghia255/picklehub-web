import { BadgeCheck, Landmark } from "lucide-react"

import type {
  PaymentStatus,
  TimelineEventType,
} from "../../mock-data/expense-types"

export function formatCurrency(value: number, locale?: string) {
  const lang =
    locale ??
    (typeof document !== "undefined" && document.documentElement?.lang) ??
    (typeof navigator !== "undefined" && navigator.language) ??
    "en-US"

  const isVietnamese = String(lang).toLowerCase().startsWith("vi")

  const currency = isVietnamese ? "VND" : "USD"
  const currencyDisplay = isVietnamese ? "code" : "symbol"
  const maximumFractionDigits = isVietnamese ? 0 : 2

  return new Intl.NumberFormat(isVietnamese ? "vi-VN" : "en-US", {
    style: "currency",
    currency,
    currencyDisplay,
    maximumFractionDigits,
  }).format(value)
}

// Backwards-compatible alias used across the expense components
export function formatVnd(value: number) {
  return formatCurrency(value)
}

export function getPaymentStatusTone(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "unpaid":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "refunded":
      return "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300"
  }
}

export function getTimelineIcon(type: TimelineEventType) {
  return type === "court-booking" ? Landmark : BadgeCheck
}
