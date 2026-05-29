"use client"

import type { Dispatch, SetStateAction } from "react"
import { create } from "zustand"

import type { BulkCourtAvailability } from "@/features/sport-center/types/court"
import type { Product } from "@/features/sport-center/types/product"
import type { Service } from "@/features/sport-center/types/service"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

export type SelectedCourts = Record<string, Set<string>>
export type ServiceSelectionState = Record<string, boolean>
export type ProductSelectionState = Record<string, number>

interface BookingStore {
  sportCenter: SportCenter | null
  centerId: string
  selectedDate: Date | undefined
  selectedCourts: SelectedCourts
  courtAvailability: BulkCourtAvailability | null
  isLoadingAvailability: boolean
  availabilityError: string
  services: Service[]
  products: Product[]
  selectedServices: ServiceSelectionState
  selectedProducts: ProductSelectionState
  bookingNote: string
  isSubmitting: boolean
  submitMessage: string
  submitError: string
  lastBookingId: string | null
  setSportCenter: (sportCenter: SportCenter) => void
  initializeBooking: (centerId: string) => void
  setSelectedDate: (date: Date | undefined) => void
  toggleCourtSlot: (courtId: string, slot: string) => void
  setSelectedServices: Dispatch<SetStateAction<ServiceSelectionState>>
  setSelectedProducts: Dispatch<SetStateAction<ProductSelectionState>>
  setBookingNote: (note: string) => void
  clearSubmissionFeedback: () => void
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
    products: [],
    selectedServices: {},
    selectedProducts: {},
    bookingNote: "",
    isSubmitting: false,
    submitMessage: "",
    submitError: "",
    lastBookingId: null,
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
      lastBookingId: null,
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

  setSelectedServices: (nextSelection) => {
    set((state) => ({
      selectedServices:
        typeof nextSelection === "function"
          ? nextSelection(state.selectedServices)
          : nextSelection,
    }))
  },

  setSelectedProducts: (nextSelection) => {
    set((state) => ({
      selectedProducts:
        typeof nextSelection === "function"
          ? nextSelection(state.selectedProducts)
          : nextSelection,
    }))
  },

  setBookingNote: (bookingNote) => set({ bookingNote }),

  clearSubmissionFeedback: () => set({ submitMessage: "", submitError: "" }),
}))

export type { BookingStore }
