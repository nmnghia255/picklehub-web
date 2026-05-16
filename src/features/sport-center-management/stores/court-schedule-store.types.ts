import type { Booking, BookingStatus, Court } from "../types"

export type SportCenter = {
  id: string
  name: string
  location?: string
  owner?: string
}

export type QuickBookingSlot = {
  courtId: string
  courtName: string
  time: string
} | null

export type BookingItem = Partial<Booking> & {
  bookingId?: string
  player?: { name?: string | null; phone?: string | null }
  userName?: string | null
  phone?: string | null
  courtName?: string | null
  courtId?: string | null
  startTime?: string | null
  slot?: string | null
}

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
