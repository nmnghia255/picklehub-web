import { BadgeCheck, Landmark } from "lucide-react"

import type { PaymentStatus, TimelineEventType } from "./expense-types"

const currencyFormatter = new Intl.NumberFormat("en-US")

export function formatVnd(value: number) {
  return `${currencyFormatter.format(value)} VND`
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
