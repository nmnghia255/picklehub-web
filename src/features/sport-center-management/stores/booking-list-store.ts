import { toast } from "sonner"
import { create } from "zustand"

import type { BookingListPagination } from "@/features/sport-center-management/actions/booking-actions"
import {
  cancelBookingAction,
  confirmBookingAction,
  listBookingListAction,
} from "@/features/sport-center-management/actions/booking-actions"

import type { BookingCreatedAtFilter } from "../components/booking-list/booking-list.utils"
import type { Booking } from "../types/booking"

type PendingAction = { bookingId: string; action: "confirm" | "cancel" } | null

interface BookingListState {
  bookings: Booking[]
  createdAtFilter: BookingCreatedAtFilter
  statusFilter: "all" | Booking["status"]
  isLoadingBookings: boolean
  loadError: string | null
  pendingAction: PendingAction
  offset: number
  limit: number
  pagination: BookingListPagination | null

  loadBookings: (centerId: string, page?: number) => Promise<void>
  confirmBooking: (bookingId: string) => Promise<void>
  cancelBooking: (bookingId: string) => Promise<void>
  setCreatedAtFilter: (f: BookingCreatedAtFilter) => void
  setStatusFilter: (s: "all" | Booking["status"]) => void
  resetFilters: () => void
  appendBookings: (items: Booking[]) => void
}

export const useBookingListStore = create<BookingListState>((set, get) => ({
  bookings: [],
  createdAtFilter: "all",
  statusFilter: "all",
  isLoadingBookings: false,
  loadError: null,
  pendingAction: null,
  offset: 0,
  limit: 20,
  pagination: null,

  loadBookings: async (centerId: string, page = 1) => {
    if (!centerId) return
    set({ isLoadingBookings: true, loadError: null })
    try {
      const {
        limit,
        createdAtFilter,
        statusFilter: currentStatusFilter,
      } = get()
      const statusFilter: "" | Booking["status"] =
        currentStatusFilter === "all" ? "" : currentStatusFilter
      const dateFilter = createdAtFilter === "all" ? "" : createdAtFilter

      const response = await listBookingListAction(
        centerId,
        statusFilter,
        "",
        dateFilter,
        (page - 1) * limit,
        limit
      )

      const items = Array.isArray(response.data) ? response.data : []
      const pagination = response.pagination ?? {
        total: items.length,
        offset: (page - 1) * limit,
        limit,
      }

      set({
        bookings: items,
        offset: pagination.offset,
        limit: pagination.limit,
        pagination,
      })
    } catch (error) {
      set({ loadError: error instanceof Error ? error.message : String(error) })
    } finally {
      set({ isLoadingBookings: false })
    }
  },

  confirmBooking: async (bookingId: string) => {
    set({ pendingAction: { bookingId, action: "confirm" } })
    try {
      const updated = await confirmBookingAction(bookingId)
      set((state: BookingListState) => ({
        bookings: state.bookings.map((b) => (b.id === bookingId ? updated : b)),
      }))
      toast.success("Xác nhận thành công")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xác nhận đặt sân."
      )
    } finally {
      set({ pendingAction: null })
    }
  },

  cancelBooking: async (bookingId: string) => {
    set({ pendingAction: { bookingId, action: "cancel" } })
    try {
      const updated = await cancelBookingAction(bookingId)
      set((state: BookingListState) => ({
        bookings: state.bookings.map((b) => (b.id === bookingId ? updated : b)),
      }))
      toast.success("Hủy lượt đặt thành công")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể hủy đặt sân."
      )
    } finally {
      set({ pendingAction: null })
    }
  },

  setCreatedAtFilter: (f: BookingCreatedAtFilter) =>
    set({ createdAtFilter: f }),
  setStatusFilter: (s: "all" | Booking["status"]) => set({ statusFilter: s }),
  resetFilters: () => set({ createdAtFilter: "all", statusFilter: "all" }),

  appendBookings: (items: Booking[]) =>
    set((state: BookingListState) => ({
      bookings: [...state.bookings, ...items],
      offset: state.offset + items.length,
    })),
}))

export default useBookingListStore
