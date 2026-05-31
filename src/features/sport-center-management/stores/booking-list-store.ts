import { create } from "zustand"

import type { BookingCreatedAtFilter } from "../components/booking-list/booking-list.utils"
import type { Booking } from "../types/booking"
import type { SportCenter } from "../types/sport-center"

type PendingAction = { bookingId: string; action: "confirm" | "cancel" } | null

interface BookingListState {
  sportCenters: SportCenter[]
  centerId: string | null
  bookings: Booking[]
  createdAtFilter: BookingCreatedAtFilter
  statusFilter: "all" | Booking["status"]
  isLoadingBookings: boolean
  loadError: string | null
  pendingAction: PendingAction

  setBookings: (items: Booking[]) => void
  setCenterId: (id: string | null) => void
  setCreatedAtFilter: (f: BookingCreatedAtFilter) => void
  setStatusFilter: (s: "all" | Booking["status"]) => void
  resetFilters: () => void
  setIsLoadingBookings: (isLoadingBookings: boolean) => void
  setLoadError: (loadError: string | null) => void
  appendBookings: (items: Booking[]) => void
}

export const useBookingListStore = create<BookingListState>((set) => ({
  sportCenters: [],
  centerId: null,
  bookings: [],
  createdAtFilter: "all",
  statusFilter: "all",
  isLoadingBookings: false,
  loadError: null,
  pendingAction: null,

  setBookings: (items: Booking[]) => set({ bookings: items }),
  setCenterId: (id: string | null) => set({ centerId: id }),
  setCreatedAtFilter: (f: BookingCreatedAtFilter) =>
    set({ createdAtFilter: f }),
  setStatusFilter: (s: "all" | Booking["status"]) => set({ statusFilter: s }),
  resetFilters: () => set({ createdAtFilter: "all", statusFilter: "all" }),

  setIsLoadingBookings: (isLoadingBookings: boolean) =>
    set({ isLoadingBookings }),
  setLoadError: (loadError: string | null) => set({ loadError }),

  appendBookings: (items: Booking[]) =>
    set((state: BookingListState) => ({
      bookings: [...state.bookings, ...items],
    })),
}))
