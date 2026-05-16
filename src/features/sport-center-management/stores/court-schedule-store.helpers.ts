import type { Booking, BookingStatus } from "../types"
import type { BookingItem } from "./court-schedule-store.types"

export function buildBookingKey(court: string, time: string) {
  return `${court}-${time}`
}

export function normalizeBooking(item: BookingItem): Booking {
  const id = item.id ?? item.bookingId ?? crypto.randomUUID()
  const courtId = item.courtId ?? ""
  const playerId = item.playerId ?? ""
  const playerName =
    item.playerName ?? item.player?.name ?? item.userName ?? "Khách"
  const date = item.date ?? new Date().toISOString().split("T")[0]
  const startTime = item.startTime ?? item.slot ?? "00:00"
  const endTime = item.endTime ?? "01:00"
  const status = (item.status ?? "PENDING") as BookingStatus
  const totalPrice = item.totalPrice ?? 0
  const note = item.note ?? ""
  const createdAt = item.createdAt ?? new Date().toISOString()
  const updatedAt = item.updatedAt ?? new Date().toISOString()
  const cancelledAt = item.cancelledAt ?? undefined
  const cancelReason = item.cancelReason ?? undefined
  const court = item.court ?? {
    id: courtId,
    name: item.courtName ?? "Sân",
  }
  const player = item.player ?? {
    id: playerId,
    name: playerName,
  }

  return {
    id,
    courtId,
    playerId,
    playerName,
    date,
    startTime,
    endTime,
    status,
    totalPrice,
    note,
    createdAt,
    updatedAt,
    cancelledAt,
    cancelReason,
    court,
    player,
  }
}

export function mapBookings(items: BookingItem[]) {
  return items.reduce<Record<string, Booking>>((accumulator, item) => {
    const booking = normalizeBooking(item)
    const courtName = booking.court?.name ?? "Sân"
    accumulator[buildBookingKey(courtName, booking.startTime)] = booking
    return accumulator
  }, {})
}

export function getDefaultDate() {
  return new Date().toISOString().slice(0, 10)
}
