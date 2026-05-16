import { listCenterCourts } from "../api/court-service"
import type { Booking } from "../types"
import type {
  CourtScheduleState,
  QuickBookingSlot,
} from "./court-schedule-store.types"

type SetState = (partial: Partial<CourtScheduleState>) => void
type GetState = () => CourtScheduleState

export async function fetchCourtsAction(set: SetState, get: GetState) {
  const { centerId } = get()

  try {
    const result = await listCenterCourts(centerId)
    set({ courts: result.courts })
  } catch (error) {
    console.error("[CourtScheduleStore] fetchCourts error:", error)
    set({ courts: [] })
  }
}

export function openBookingAction(booking: Booking, set: SetState) {
  set({ selectedBooking: booking })
}

export function closeBookingAction(set: SetState) {
  set({ selectedBooking: null })
}

export function openQuickBookingAction(
  slot: NonNullable<QuickBookingSlot>,
  set: SetState
) {
  set({ quickBookingSlot: slot })
}

export function closeQuickBookingAction(set: SetState) {
  set({
    quickBookingSlot: null,
    quickBookingPlayerName: "",
    quickBookingNote: "",
  })
}

export function rebookFromCancelledAction(booking: Booking, set: SetState) {
  set({
    selectedBooking: null,
    quickBookingSlot: { court: booking.court, time: booking.time },
  })
}
