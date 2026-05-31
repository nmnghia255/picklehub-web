import type { BookingStatus } from "../../types/booking"
import { getBookingStatusLabel } from "./booking-list.utils"

const statusStyles: Record<BookingStatus, string> = {
  PENDING:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/60 dark:text-amber-200",
  CONFIRMED:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-200",
  CANCELLED:
    "border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-200",
  COMPLETED:
    "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/60 dark:text-sky-200",
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {getBookingStatusLabel(status)}
    </span>
  )
}
