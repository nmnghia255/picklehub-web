"use client"

import { create } from "zustand"

import enManagement from "@/i18n/locales/en/sport-center-management.json"
import viManagement from "@/i18n/locales/vi/sport-center-management.json"

import { createBookingAction } from "../actions/create-booking-action"
import { listOwnerSportCentersAction } from "../actions/sport-center-actions"
import type { Booking, BookingSlot, BookingStatus } from "../types/booking"
import type { Court } from "../types/court"
import type { SportCenter } from "../types/sport-center"
// booking actions implemented locally to avoid missing module and to use client fetch

function getManagementLocale() {
  const language =
    typeof navigator !== "undefined" ? (navigator.language ?? "") : ""
  return language.toLowerCase().startsWith("vi") ? viManagement : enManagement
}

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
      method: "PATCH",
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

export async function createBookingByOwnerAction(
  playerName: string,
  contact: string,
  note: string,
  get: GetState
) {
  const { quickBookingSlots, quickBookingSlot, date, centerId } = get()
  const activeSlots =
    quickBookingSlots && quickBookingSlots.length > 0
      ? quickBookingSlots
      : quickBookingSlot
        ? [quickBookingSlot]
        : []

  if (activeSlots.length === 0) return

  const bookingSlots: BookingSlot[] = activeSlots.map((slot) => {
    const startTime = slot.time
    const endTime = (() => {
      try {
        const [h, m] = startTime.split(":").map(Number)
        const dt = new Date()
        dt.setHours(h, m)
        dt.setMinutes(dt.getMinutes() + 30)

        const hours = String(dt.getHours()).padStart(2, "0")
        const minutes = String(dt.getMinutes()).padStart(2, "0")
        return `${hours}:${minutes}`
      } catch {
        return startTime
      }
    })()

    return {
      courtId: slot.courtId,
      startTime,
      endTime,
    }
  })

  const result = await createBookingAction(
    centerId,
    date,
    playerName,
    contact,
    note,
    bookingSlots
  )

  await get().fetchBookings()
  return result
}

export interface Slot {
  courtId: string
  courtName: string
  time: string
}

export interface CourtScheduleState {
  courts: Court[]
  bookings: Record<string, Booking>
  selectedBooking: Booking | null
  selectedSlot: Slot | null
  quickBookingSlot: Slot | null
  quickBookingSlots: Slot[]
  quickBookingPlayerName: string
  quickBookingPhone: string
  quickBookingNote: string
  date: string
  courtFilter: string
  loading: boolean
  centerId: string
  sportCenters: SportCenter[]
  loadingSportCenters: boolean
  sportCentersAttempted: boolean
  selectedCenter: SportCenter | null
  retryFetchSportCenters: () => void
  setSelectedCenter: (center: SportCenter | null) => void
  setDate: (date: string) => void
  setCourtFilter: (courtFilter: string) => void
  setQuickBookingPlayerName: (playerName: string) => void
  setQuickBookingPhone: (phone: string) => void
  setQuickBookingNote: (note: string) => void
  setCenterId: (centerId: string) => void
  fetchSportCenters: () => Promise<void>
  fetchCourts: () => Promise<void>
  openBooking: (booking: Booking, slot: Slot) => void
  closeBooking: () => void
  openQuickBooking: (slot: Slot | Slot[]) => void
  closeQuickBooking: () => void
  rebookFromCancelled: (booking: Booking) => void
  fetchBookings: () => Promise<void>
  cancelBooking: (bookingId: string) => Promise<void>
  createBookingByOwner: (
    playerName: string,
    contact: string,
    note: string
  ) => Promise<Booking | void>
}

export type { Booking, BookingStatus }

export function buildBookingKey(court: string, time: string) {
  return `${court}-${time}`
}

export function getTimeSlotsInRange(
  startTime: string,
  endTime: string
): string[] {
  if (!startTime) return []
  const cleanStart = startTime.slice(0, 5)
  if (!endTime) return [cleanStart]

  const slots: string[] = []
  try {
    const [startH, startM] = startTime.split(":").map(Number)
    const [endH, endM] = endTime.split(":").map(Number)

    if (
      Number.isNaN(startH) ||
      Number.isNaN(startM) ||
      Number.isNaN(endH) ||
      Number.isNaN(endM)
    ) {
      return [cleanStart]
    }

    let startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    if (startMinutes >= endMinutes) {
      return [cleanStart]
    }

    while (startMinutes < endMinutes) {
      const h = Math.floor(startMinutes / 60)
      const m = startMinutes % 60
      const formatted = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      slots.push(formatted)
      startMinutes += 30
    }
  } catch {
    return [cleanStart]
  }
  return slots
}

export function mapBookings(items: Booking[]) {
  if (!items || items.length === 0) return {}
  const management = getManagementLocale()

  return items.reduce<Record<string, Booking>>((accumulator, booking) => {
    let processed = false

    if (booking.bookingItems && booking.bookingItems.length > 0) {
      for (const item of booking.bookingItems) {
        const courtName =
          item.court?.name ??
          booking.center?.name ??
          management.courts.detail.noCourtName

        const slots = getTimeSlotsInRange(item.startTime, item.endTime)
        for (const slotTime of slots) {
          accumulator[buildBookingKey(courtName, slotTime)] = booking
          processed = true
        }
      }
    }

    if (booking.items && booking.items.length > 0) {
      for (const item of booking.items) {
        const courtName =
          item.courtName ??
          booking.center?.name ??
          management.courts.detail.noCourtName

        const slots = getTimeSlotsInRange(item.startTime, item.endTime)
        for (const slotTime of slots) {
          accumulator[buildBookingKey(courtName, slotTime)] = booking
          processed = true
        }
      }
    }

    if (!processed) {
      const courtName =
        booking.center?.name ?? management.courts.detail.noCourtName
      const time = booking.createdAt ? booking.createdAt.slice(11, 16) : "00:00"
      accumulator[buildBookingKey(courtName, time)] = booking
    }

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

export function openBookingAction(booking: Booking, slot: Slot, set: SetState) {
  set({ selectedBooking: booking })
  set({ selectedSlot: slot })
}

export function closeBookingAction(set: SetState) {
  set({ selectedBooking: null })
}

export function openQuickBookingAction(slot: Slot | Slot[], set: SetState) {
  if (Array.isArray(slot)) {
    set({
      quickBookingSlots: slot,
      quickBookingSlot: slot[0] ?? null,
    })
  } else {
    set({
      quickBookingSlots: [slot],
      quickBookingSlot: slot,
    })
  }
}

export function closeQuickBookingAction(set: SetState) {
  set({
    quickBookingSlot: null,
    quickBookingSlots: [],
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

  const rebookSlot = {
    courtId: matchedCourt?.id ?? item?.court?.id ?? "",
    courtName: item?.court?.name ?? "",
    time: item?.startTime ?? booking.createdAt,
  }

  set({
    selectedBooking: null,
    quickBookingSlot: rebookSlot,
    quickBookingSlots: [rebookSlot],
  })
}

export const useCourtScheduleStore = create<CourtScheduleState>((set, get) => ({
  courts: [],
  bookings: {},
  selectedBooking: null,
  selectedSlot: null,
  quickBookingSlot: null,
  quickBookingSlots: [],
  quickBookingPlayerName: "",
  quickBookingPhone: "",
  quickBookingNote: "",
  date: getDefaultDate(),
  courtFilter: "all",
  loading: false,
  sportCenters: [],
  selectedCenter: null,
  loadingSportCenters: false,
  sportCentersAttempted: false,
  centerId: "",

  setSelectedCenter: (center) => set({ selectedCenter: center }),
  setDate: (date) => set({ date }),
  setCourtFilter: (courtFilter) => set({ courtFilter }),
  setQuickBookingPlayerName: (quickBookingPlayerName) =>
    set({ quickBookingPlayerName }),
  setQuickBookingPhone: (quickBookingPhone) => set({ quickBookingPhone }),
  setQuickBookingNote: (quickBookingNote) => set({ quickBookingNote }),
  setCenterId: (centerId) => {
    set({ centerId })
    get().fetchCourts()
    get().fetchBookings()
  },
  fetchSportCenters: async () => {
    if (get().sportCentersAttempted && get().sportCenters.length > 0) return
    set({ sportCentersAttempted: true, loadingSportCenters: true })

    try {
      let centers: SportCenter[] = []
      try {
        centers = await listOwnerSportCentersAction()
      } catch {
        const res = await fetch("/api/sport-centers/me", {
          credentials: "include",
        })
        const json = (await res.json().catch(() => ({}))) as {
          data?: SportCenter[]
        }
        const raw =
          json && typeof json === "object" && "data" in json ? json.data : json
        centers = Array.isArray(raw) ? (raw as SportCenter[]) : []
      }

      set({
        sportCenters: centers,
        centerId: centers.length > 0 ? get().centerId || centers[0].id : "",
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
  openBooking: (booking, slot) => openBookingAction(booking, slot, set),
  closeBooking: () => closeBookingAction(set),
  openQuickBooking: (slot) => openQuickBookingAction(slot, set),
  closeQuickBooking: () => closeQuickBookingAction(set),
  rebookFromCancelled: (booking) =>
    rebookFromCancelledAction(booking, set, get),
  fetchBookings: async () => fetchBookingsAction(set, get),
  cancelBooking: async (bookingId) => cancelBookingAction(bookingId, set, get),
  createBookingByOwner: async (playerName, contact, note) =>
    await createBookingByOwnerAction(playerName, contact, note, get),
}))
