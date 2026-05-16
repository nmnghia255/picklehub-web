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

export async function fetchBookingsAction(set: SetState, get: GetState) {
  const { centerId, date } = get()
  set({ loading: true })

  try {
    const payload = (await listCenterBookings(centerId, { date })) as {
      data?: unknown
    }
    const items = Array.isArray(payload.data)
      ? (payload.data as BookingItem[])
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
    await createBookingForCourt(centerId, quickBookingSlot.court, {
      date,
      startTime: quickBookingSlot.time,
      endTime: quickBookingSlot.time,
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
    await createBookingForCourtByOwner(centerId, quickBookingSlot.court, {
      date,
      startTime: quickBookingSlot.time,
      endTime: quickBookingSlot.time,
      playerName,
      note: `${playerName} | ${note}`,
    })

    set({ quickBookingSlot: null })
    await get().fetchBookings()
  } catch (error) {
    console.error("[CourtScheduleStore] createBookingByOwner error:", error)
  }
}
