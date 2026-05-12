"use client"

import { create } from "zustand"

import {
  cancelBookingByOwner,
  createBookingForCourt,
  listCenterBookings,
} from "../api/booking-service"

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

export interface Booking {
  id: string
  playerName: string
  contact: string
  status: BookingStatus
  time: string
  court: string
}

type QuickBookingSlot = {
  court: string
  time: string
} | null

type BookingItem = Partial<Booking> & {
  bookingId?: string
  player?: { name?: string | null; phone?: string | null }
  userName?: string | null
  phone?: string | null
  courtName?: string | null
  courtId?: string | null
  startTime?: string | null
  slot?: string | null
}

interface CourtScheduleState {
  bookings: Record<string, Booking>
  selectedBooking: Booking | null
  quickBookingSlot: QuickBookingSlot
  date: string
  courtFilter: string
  loading: boolean
  centerId: string
  setDate: (date: string) => void
  setCourtFilter: (courtFilter: string) => void
  openBooking: (booking: Booking) => void
  closeBooking: () => void
  openQuickBooking: (slot: NonNullable<QuickBookingSlot>) => void
  closeQuickBooking: () => void
  rebookFromCancelled: (booking: Booking) => void
  fetchBookings: () => Promise<void>
  cancelBooking: (bookingId: string) => Promise<void>
  createBooking: (playerName: string, contact: string) => Promise<void>
}

const courts = ["Sân 1", "Sân 2", "Sân 3", "Sân 4"]

function buildBookingKey(court: string, time: string) {
  return `${court}-${time}`
}

function normalizeBooking(item: BookingItem): Booking {
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

function mapBookings(items: BookingItem[]) {
  return items.reduce<Record<string, Booking>>((accumulator, item) => {
    const booking = normalizeBooking(item)
    accumulator[buildBookingKey(booking.court, booking.time)] = booking
    return accumulator
  }, {})
}

function getDefaultDate() {
  return new Date().toISOString().slice(0, 10)
}

export const useCourtScheduleStore = create<CourtScheduleState>((set, get) => ({
  bookings: {},
  selectedBooking: null,
  quickBookingSlot: null,
  date: getDefaultDate(),
  courtFilter: "all",
  loading: false,
  centerId: process.env.NEXT_PUBLIC_DEFAULT_CENTER_ID ?? "default-center",

  setDate: (date) => set({ date }),
  setCourtFilter: (courtFilter) => set({ courtFilter }),
  openBooking: (booking) => set({ selectedBooking: booking }),
  closeBooking: () => set({ selectedBooking: null }),
  openQuickBooking: (slot) => set({ quickBookingSlot: slot }),
  closeQuickBooking: () => set({ quickBookingSlot: null }),
  rebookFromCancelled: (booking) =>
    set({
      selectedBooking: null,
      quickBookingSlot: { court: booking.court, time: booking.time },
    }),

  fetchBookings: async () => {
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
  },

  cancelBooking: async (bookingId) => {
    try {
      await cancelBookingByOwner(bookingId)

      await get().fetchBookings()
    } catch (error) {
      console.error("[CourtScheduleStore] cancelBooking error:", error)
    } finally {
      set({ selectedBooking: null })
    }
  },

  createBooking: async (playerName, contact) => {
    const { centerId, date, quickBookingSlot } = get()

    if (!quickBookingSlot) {
      return
    }

    try {
      await createBookingForCourt(centerId, quickBookingSlot.court, {
        date,
        startTime: quickBookingSlot.time,
        endTime: quickBookingSlot.time,
        note: `${playerName} | ${contact}`,
      })

      set({ quickBookingSlot: null })
      await get().fetchBookings()
    } catch (error) {
      console.error("[CourtScheduleStore] createBooking error:", error)
    }
  },
}))

export function getCourtNames() {
  return courts
}
