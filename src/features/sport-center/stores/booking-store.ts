"use client"

import type { Dispatch, SetStateAction } from "react"
import { create } from "zustand"

import { ADD_ONS } from "@/features/booking/data"
import type { ExtrasState, SelectedCourts } from "@/features/booking/types"
import { createSportCenterBookingsAction } from "@/features/sport-center/actions/create-booking"
import { fetchBulkCourtAvailabilityAction } from "@/features/sport-center/actions/fetch-bulk-court-availability"
import { fetchSportCenterServicesAction } from "@/features/sport-center/actions/fetch-sport-center-services"
import type { BookingRequest } from "@/features/sport-center/types/booking"
import type { BulkCourtAvailability } from "@/features/sport-center/types/court"
import type { Service } from "@/features/sport-center/types/service"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

const DEFAULT_EXTRAS: ExtrasState = {
  paddle: true,
  balls: false,
  coach: false,
}

type BookingPayload = {
  courtId: string
  bookingRequest: BookingRequest
}

interface BookingStore {
  sportCenter: SportCenter | null
  centerId: string
  selectedDate: Date | undefined
  selectedCourts: SelectedCourts
  courtAvailability: BulkCourtAvailability | null
  isLoadingAvailability: boolean
  availabilityError: string
  services: Service[]
  extras: ExtrasState
  bookingNote: string
  isSubmitting: boolean
  submitMessage: string
  submitError: string
  setSportCenter: (sportCenter: SportCenter) => void
  initializeBooking: (centerId: string) => void
  setSelectedDate: (date: Date | undefined) => void
  toggleCourtSlot: (courtId: string, slot: string) => void
  setExtras: Dispatch<SetStateAction<ExtrasState>>
  setBookingNote: (note: string) => void
  clearSubmissionFeedback: () => void
  fetchCourtAvailability: (centerId: string, date: Date) => Promise<void>
  fetchServices: (centerId: string) => Promise<void>
  submitBookings: () => Promise<boolean>
}

function formatBookingDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function parseBookingSlot(slot: string) {
  const [startTime = "", endTime = ""] = slot.split(" - ")

  return { startTime, endTime }
}

function buildBookingRequests(
  selectedDate: Date,
  selectedCourts: SelectedCourts,
  extras: ExtrasState,
  bookingNote: string
): BookingPayload[] {
  const bookingDate = formatBookingDate(selectedDate)
  const selectedAddOns = ADD_ONS.filter((addon) => extras[addon.key]).map(
    (addon) => addon.label
  )
  const noteParts = [bookingNote.trim()]

  if (selectedAddOns.length > 0) {
    noteParts.push(`Dịch vụ bổ sung: ${selectedAddOns.join(", ")}`)
  }

  const note = noteParts.filter(Boolean).join("\n")

  return Object.entries(selectedCourts).flatMap(([courtId, slots]) =>
    Array.from(slots).map((slot) => {
      const { startTime, endTime } = parseBookingSlot(slot)

      return {
        courtId: courtId.toString(),
        bookingRequest: {
          date: bookingDate,
          startTime,
          endTime,
          serviceItems: [],
          productItems: [],
          note,
        },
      }
    })
  )
}

function getDefaultState(centerId = "") {
  return {
    sportCenter: null,
    centerId,
    selectedDate: new Date(),
    selectedCourts: {},
    courtAvailability: null,
    isLoadingAvailability: false,
    availabilityError: "",
    services: [],
    extras: { ...DEFAULT_EXTRAS },
    bookingNote: "",
    isSubmitting: false,
    submitMessage: "",
    submitError: "",
  }
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  ...getDefaultState(),

  setSportCenter: (sportCenter) =>
    set((state) => ({
      sportCenter,
      centerId: sportCenter.id,
      selectedDate: state.selectedDate ?? new Date(),
    })),

  initializeBooking: (centerId) =>
    set((state) => ({
      ...getDefaultState(centerId),
      sportCenter:
        state.sportCenter?.id === centerId ? state.sportCenter : null,
    })),

  setSelectedDate: (selectedDate) =>
    set({
      selectedDate,
      selectedCourts: {},
      submitMessage: "",
      submitError: "",
    }),

  toggleCourtSlot: (courtId, slot) => {
    set((state) => {
      const nextSelectedCourts = { ...state.selectedCourts }

      if (!nextSelectedCourts[courtId]) {
        nextSelectedCourts[courtId] = new Set()
      } else {
        nextSelectedCourts[courtId] = new Set(nextSelectedCourts[courtId])
      }

      if (nextSelectedCourts[courtId].has(slot)) {
        nextSelectedCourts[courtId].delete(slot)
        if (nextSelectedCourts[courtId].size === 0) {
          delete nextSelectedCourts[courtId]
        }
      } else {
        nextSelectedCourts[courtId].add(slot)
      }

      return { selectedCourts: nextSelectedCourts }
    })
  },

  setExtras: (nextExtras) => {
    set((state) => ({
      extras:
        typeof nextExtras === "function"
          ? nextExtras(state.extras)
          : nextExtras,
    }))
  },

  setBookingNote: (bookingNote) => set({ bookingNote }),

  clearSubmissionFeedback: () => set({ submitMessage: "", submitError: "" }),

  fetchCourtAvailability: async (centerId, date) => {
    set({ isLoadingAvailability: true, availabilityError: "" })

    try {
      const courtAvailability = await fetchBulkCourtAvailabilityAction(
        centerId,
        date
      )

      set({
        courtAvailability,
      })
    } catch (error) {
      set({
        courtAvailability: null,
        availabilityError:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách sân trống.",
      })
    } finally {
      set({ isLoadingAvailability: false })
    }
  },

  fetchServices: async (centerId) => {
    try {
      const services = await fetchSportCenterServicesAction(centerId)
      set({ services })
    } catch {
      set({ services: [] })
    }
  },

  submitBookings: async () => {
    const { centerId, selectedDate, selectedCourts, extras, bookingNote } =
      get()

    if (!centerId) {
      set({ submitError: "Không tìm thấy mã sân." })
      return false
    }

    if (!selectedDate) {
      set({ submitError: "Vui lòng chọn ngày đặt sân." })
      return false
    }

    const bookings = buildBookingRequests(
      selectedDate,
      selectedCourts,
      extras,
      bookingNote
    )

    if (bookings.length === 0) {
      set({ submitError: "Vui lòng chọn ít nhất một sân và khung giờ." })
      return false
    }

    set({ isSubmitting: true, submitMessage: "", submitError: "" })

    try {
      const result = await createSportCenterBookingsAction({
        centerId,
        bookings,
      })

      if (!result.success) {
        set({ submitError: result.error ?? "Không thể gửi yêu cầu đặt sân." })
        return false
      }

      set({
        selectedCourts: {},
        extras: { ...DEFAULT_EXTRAS },
        bookingNote: "",
        submitMessage: result.message ?? "Đã gửi yêu cầu đặt sân thành công.",
      })

      return true
    } catch (error) {
      set({
        submitError:
          error instanceof Error
            ? error.message
            : "Không thể gửi yêu cầu đặt sân.",
      })
      return false
    } finally {
      set({ isSubmitting: false })
    }
  },
}))

export type { BookingStore }
