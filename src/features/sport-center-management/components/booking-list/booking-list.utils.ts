import type { Booking, BookingStatus } from "../../types/booking"

export type BookingCreatedAtFilter = "all" | `${number}-${number}-${number}`

export const bookingStatusOptions: Array<{
  value: "all" | BookingStatus
  label: string
}> = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "PENDING", label: getBookingStatusLabel("PENDING") },
  { value: "CONFIRMED", label: getBookingStatusLabel("CONFIRMED") },
  { value: "CANCELLED", label: getBookingStatusLabel("CANCELLED") },
  { value: "COMPLETED", label: getBookingStatusLabel("COMPLETED") },
]

function parseLocalDateTime(value: string | undefined | null): Date | null {
  if (!value) return null

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function matchesCreatedAtFilter(
  booking: Booking,
  filter: BookingCreatedAtFilter
) {
  if (filter === "all") return true

  const createdAt = parseLocalDateTime(booking.createdAt)
  if (!createdAt) return false

  return formatDateKey(createdAt) === filter
}

export function sortBookingsByNewest(bookings: Booking[]) {
  return [...bookings].sort((left, right) => {
    const leftCreatedAt = parseLocalDateTime(left.createdAt)?.getTime() ?? 0
    const rightCreatedAt = parseLocalDateTime(right.createdAt)?.getTime() ?? 0

    return rightCreatedAt - leftCreatedAt
  })
}

export function formatBookingDate(dateText: string) {
  const parsed = new Date(`${dateText}`)
  if (Number.isNaN(parsed.getTime())) {
    return dateText
  }

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed)
}

export function formatBookingCreatedAt(timestamp?: string | null) {
  const parsed = parseLocalDateTime(timestamp)
  if (!parsed) return "—"

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed)
}

export function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

export function getBookingDisplayNote(booking: Booking) {
  const note = booking.note?.trim() ?? ""
  if (!note) {
    return "Không có ghi chú"
  }

  const prefix = `${booking.playerName} | `
  if (note.startsWith(prefix)) {
    return note.slice(prefix.length).trim() || "Không có ghi chú"
  }

  return note
}

export function getBookingStatusLabel(status: BookingStatus | string) {
  switch (status) {
    case "PENDING":
      return "Chờ xác nhận"
    case "CONFIRMED":
      return "Đã xác nhận"
    case "CANCELLED":
      return "Đã hủy"
    case "COMPLETED":
      return "Hoàn thành"
    default:
      return status
  }
}
