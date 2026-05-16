"use client"

import { create } from "zustand"

import { listOwnerSportCenters } from "../api/sport-center-service"
import type { Booking, BookingStatus } from "../types"
import {
  cancelBookingAction,
  createBookingAction,
  createBookingByOwnerAction,
  fetchBookingsAction,
} from "./booking-store.actions"
import {
  closeBookingAction,
  closeQuickBookingAction,
  fetchCourtsAction,
  openBookingAction,
  openQuickBookingAction,
  rebookFromCancelledAction,
} from "./court-schedule-store.actions"
import { getDefaultDate } from "./court-schedule-store.helpers"
import type { CourtScheduleState } from "./court-schedule-store.types"

export type { Booking, BookingStatus }

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
    set({ loadingSportCenters: true })

    try {
      const centers = await listOwnerSportCenters()

      set({
        sportCenters: centers,
        centerId: centers.length > 0 ? centers[0].id : "",
      })
    } catch (error) {
      console.error("[CourtScheduleStore] fetchSportCenters error:", error)
      set({ sportCenters: [] })
    } finally {
      set({ loadingSportCenters: false })
    }
  },
  fetchCourts: async () => fetchCourtsAction(set, get),
  openBooking: (booking) => openBookingAction(booking, set),
  closeBooking: () => closeBookingAction(set),
  openQuickBooking: (slot) => openQuickBookingAction(slot, set),
  closeQuickBooking: () => closeQuickBookingAction(set),
  rebookFromCancelled: (booking) => rebookFromCancelledAction(booking, set),
  fetchBookings: async () => fetchBookingsAction(set, get),
  cancelBooking: async (bookingId) => cancelBookingAction(bookingId, set, get),
  createBooking: async (playerName, note) =>
    createBookingAction(playerName, note, set, get),
  createBookingByOwner: async (playerName, note) =>
    createBookingByOwnerAction(playerName, note, set, get),
}))
