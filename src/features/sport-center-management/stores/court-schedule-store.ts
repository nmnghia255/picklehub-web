"use client"

import { create } from "zustand"

import { listOwnerSportCentersAction } from "../actions/sport-center-actions"
import type { Booking, BookingStatus } from "../types/booking"
import type { Court } from "../types/court"
import type { SportCenter } from "../types/sport-center"
// booking actions implemented locally to avoid missing module and to use client fetch

export async function fetchBookingsAction(set: SetState, get: GetState) {
  const { centerId, date, courtFilter } = get()

  if (!centerId) {
    set({ bookings: {} })
    return
  }

  try {
    const courtParam = courtFilter && courtFilter !== "all" ? courtFilter : ""
    const res = await fetch(
      `/api/sport-centers/${centerId}/bookings?courts=${courtParam}&date=${date}&status=`,
      { credentials: "include" }
    )
    const payload = await res.json()
    const bookingsArr = payload && payload.data ? payload.data : payload
    set({ bookings: mapBookings(bookingsArr) })
  } catch (error) {
    console.error("Fetch Bookings error:", error)
    set({ bookings: {} })
  }
}

export async function cancelBookingAction(
  bookingId: string,
  set: SetState,
  get: GetState
) {
  try {
    await fetch(`/api/bookings/${bookingId}/cancel-by-owner`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    // refresh list
    get().fetchBookings()
  } catch (error) {
    console.error("Cancel Booking error:", error)
    throw error
  }
}

export async function createBookingAction(
  playerName: string,
  note: string,
  set: SetState,
  get: GetState
) {
  const { centerId, quickBookingSlot } = get()
  if (!centerId || !quickBookingSlot) return

  const startTime = quickBookingSlot.time
  // naive 1-hour endTime
  const endTime = (() => {
    try {
      const [h, m] = startTime.split(":").map(Number)
      const dt = new Date()
      dt.setHours(h + 1, m)
      return dt.toTimeString().slice(0, 5)
    } catch {
      return startTime
    }
  })()

  const body = {
    date: get().date,
    items: [{ courtId: quickBookingSlot.courtId, startTime, endTime }],
    playerName,
    phoneNumber: "",
    note,
  }

  try {
    await fetch(`/api/sport-centers/${centerId}/bookings`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    get().fetchBookings()
  } catch (error) {
    console.error("Create Booking error:", error)
    throw error
  }
}

export async function createBookingByOwnerAction(
  playerName: string,
  note: string,
  set: SetState,
  get: GetState
) {
  // alias to createBookingAction for now
  return createBookingAction(playerName, note, set, get)
}

// --- Local helpers/types ---
export type QuickBookingSlot = {
  courtId: string
  courtName: string
  time: string
} | null

export interface CourtScheduleState {
  courts: Court[]
  bookings: Record<string, Booking>
  selectedBooking: Booking | null
  quickBookingSlot: QuickBookingSlot
  quickBookingPlayerName: string
  quickBookingNote: string
  date: string
  courtFilter: string
  loading: boolean
  centerId: string
  sportCenters: SportCenter[]
  loadingSportCenters: boolean
  sportCentersAttempted: boolean
  retryFetchSportCenters: () => void
  setDate: (date: string) => void
  setCourtFilter: (courtFilter: string) => void
  setQuickBookingPlayerName: (playerName: string) => void
  setQuickBookingNote: (note: string) => void
  setCenterId: (centerId: string) => void
  fetchSportCenters: () => Promise<void>
  fetchCourts: () => Promise<void>
  openBooking: (booking: Booking) => void
  closeBooking: () => void
  openQuickBooking: (slot: NonNullable<QuickBookingSlot>) => void
  closeQuickBooking: () => void
  rebookFromCancelled: (booking: Booking) => void
  fetchBookings: () => Promise<void>
  cancelBooking: (bookingId: string) => Promise<void>
  createBooking: (playerName: string, note: string) => Promise<void>
  createBookingByOwner: (playerName: string, note: string) => Promise<void>
}

export type { Booking, BookingStatus }

export function buildBookingKey(court: string, time: string) {
  return `${court}-${time}`
}

export function mapBookings(items: Booking[]) {
  return items.reduce<Record<string, Booking>>((accumulator, booking) => {
    const item = booking.bookingItems?.[0]
    const courtName = item?.court?.name ?? booking.center?.name ?? "Sân"
    const time = item?.startTime ?? booking.createdAt
    accumulator[buildBookingKey(courtName, time)] = booking
    return accumulator
  }, {})
}

export function getDefaultDate() {
  return new Date().toISOString().slice(0, 10)
}

type SetState = (partial: Partial<CourtScheduleState>) => void
type GetState = () => CourtScheduleState

export async function fetchCourtsAction(set: SetState, get: GetState) {
  const { centerId } = get()

  try {
    const res = await fetch(`/api/sport-centers/${centerId}/courts`, {
      credentials: "include",
    })
    const payload = await res.json()
    const courts = payload && payload.data ? payload.data : payload
    set({ courts })
  } catch (error) {
    console.error("Fetch Courts error:", error)
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

export function rebookFromCancelledAction(
  booking: Booking,
  set: SetState,
  get: GetState
) {
  const item = booking.bookingItems?.[0]

  const matchedCourt = get().courts.find((court) =>
    Boolean(item?.court && court.name === item.court.name)
  )

  set({
    selectedBooking: null,
    quickBookingSlot: {
      courtId: matchedCourt?.id ?? item?.court?.id ?? "",
      courtName: item?.court?.name ?? "",
      time: item?.startTime ?? booking.createdAt,
    },
  })
}

export const useCourtScheduleStore = create<CourtScheduleState>((set, get) => ({
  courts: [],
  bookings: {},
  selectedBooking: null,
  quickBookingSlot: null,
  quickBookingPlayerName: "",
  quickBookingNote: "",
  date: getDefaultDate(),
  courtFilter: "all",
  loading: false,
  sportCenters: [],
  loadingSportCenters: false,
  sportCentersAttempted: false,
  centerId: "",

  setDate: (date) => set({ date }),
  setCourtFilter: (courtFilter) => set({ courtFilter }),
  setQuickBookingPlayerName: (quickBookingPlayerName) =>
    set({ quickBookingPlayerName }),
  setQuickBookingNote: (quickBookingNote) => set({ quickBookingNote }),
  setCenterId: (centerId) => {
    set({ centerId })
    get().fetchCourts()
    get().fetchBookings()
  },
  fetchSportCenters: async () => {
    // do not attempt more than once unless retryFetchSportCenters clears the flag
    if (get().sportCentersAttempted) return
    set({ sportCentersAttempted: true, loadingSportCenters: true })

    try {
      const centers = await listOwnerSportCentersAction()

      set({
        sportCenters: centers,
        centerId: centers.length > 0 ? centers[0].id : "",
      })
    } catch (error) {
      console.error("Fetch Sport Centers error:", error)
      set({ sportCenters: [] })
    } finally {
      set({ loadingSportCenters: false })
    }
  },

  retryFetchSportCenters: () => {
    set({ sportCentersAttempted: false })
  },
  fetchCourts: async () => fetchCourtsAction(set, get),
  openBooking: (booking) => openBookingAction(booking, set),
  closeBooking: () => closeBookingAction(set),
  openQuickBooking: (slot) => openQuickBookingAction(slot, set),
  closeQuickBooking: () => closeQuickBookingAction(set),
  rebookFromCancelled: (booking) =>
    rebookFromCancelledAction(booking, set, get),
  fetchBookings: async () => fetchBookingsAction(set, get),
  cancelBooking: async (bookingId) => cancelBookingAction(bookingId, set, get),
  createBooking: async (playerName, note) =>
    createBookingAction(playerName, note, set, get),
  createBookingByOwner: async (playerName, note) =>
    createBookingByOwnerAction(playerName, note, set, get),
}))
