import type { Booking, BookingStatus } from "../types"
import type { BookingItem } from "./court-schedule-store.types"

export function buildBookingKey(court: string, time: string) {
  return `${court}-${time}`
}

export function normalizeBooking(item: BookingItem): Booking {
  const id = item.id ?? item.bookingId ?? crypto.randomUUID()
  const playerName =
    item.playerName ?? item.player?.name ?? item.userName ?? "Khách"
  const contact = item.contact ?? item.player?.phone ?? item.phone ?? ""
  const status = (item.status ?? "PENDING") as BookingStatus
  const time = item.time ?? item.startTime ?? item.slot ?? "00:00"
  const court = item.court ?? item.courtName ?? item.courtId ?? "Sân 1"

  return {
    id,
    playerName,
    contact,
    status,
    time,
    court,
  }
}

export function mapBookings(items: BookingItem[]) {
  return items.reduce<Record<string, Booking>>((accumulator, item) => {
    const booking = normalizeBooking(item)
    accumulator[buildBookingKey(booking.court, booking.time)] = booking
    return accumulator
  }, {})
}

export function getDefaultDate() {
  return new Date().toISOString().slice(0, 10)
}
