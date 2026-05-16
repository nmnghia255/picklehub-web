import {
  cancelBookingByOwner,
  createBookingForCourt,
  createBookingForCourtByOwner,
  listCenterBookings,
} from "../api/booking-service"
import { mapBookings } from "./court-schedule-store.helpers"
import type {
  BookingItem,
  CourtScheduleState,
} from "./court-schedule-store.types"

type SetState = (partial: Partial<CourtScheduleState>) => void
type GetState = () => CourtScheduleState

function getEndTime(startTime: string): string {
  const [hourText, minuteText] = startTime.split(":")
  const hour = Number(hourText)
  const minute = Number(minuteText)

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return startTime
  }

  const endHour = (hour + 1) % 24
  return `${String(endHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export async function fetchBookingsAction(set: SetState, get: GetState) {
  const { centerId, date } = get()
  set({ loading: true })

  try {
    const result = await listCenterBookings(centerId, { date })
    const items = Array.isArray(result.data)
      ? (result.data as BookingItem[])
      : []

    set({ bookings: mapBookings(items) })
  } catch (error) {
    console.error("[CourtScheduleStore] fetchBookings error:", error)
  } finally {
    set({ loading: false })
  }
}

export async function cancelBookingAction(
  bookingId: string,
  set: SetState,
  get: GetState
) {
  try {
    await cancelBookingByOwner(bookingId)
    await get().fetchBookings()
  } catch (error) {
    console.error("[CourtScheduleStore] cancelBooking error:", error)
  } finally {
    set({ selectedBooking: null })
  }
}

export async function createBookingAction(
  playerName: string,
  note: string,
  set: SetState,
  get: GetState
) {
  const { centerId, date, quickBookingSlot } = get()

  if (!quickBookingSlot) {
    return
  }

  try {
    await createBookingForCourt(centerId, quickBookingSlot.courtId, {
      date,
      startTime: quickBookingSlot.time,
      endTime: getEndTime(quickBookingSlot.time),
      playerName,
      note: `${playerName} | ${note}`,
    })

    set({ quickBookingSlot: null })
    await get().fetchBookings()
  } catch (error) {
    console.error("[CourtScheduleStore] createBooking error:", error)
  }
}

export async function createBookingByOwnerAction(
  playerName: string,
  note: string,
  set: SetState,
  get: GetState
) {
  const { centerId, date, quickBookingSlot } = get()

  if (!quickBookingSlot) {
    return
  }

  try {
    await createBookingForCourtByOwner(centerId, quickBookingSlot.courtId, {
      date,
      startTime: quickBookingSlot.time,
      endTime: getEndTime(quickBookingSlot.time),
      playerName,
      note: `${playerName} | ${note}`,
    })

    set({ quickBookingSlot: null })
    await get().fetchBookings()
  } catch (error) {
    console.error("[CourtScheduleStore] createBookingByOwner error:", error)
  }
}
