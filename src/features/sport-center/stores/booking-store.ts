"use client"

import type { Dispatch, SetStateAction } from "react"
import { create } from "zustand"

import { useSportCenterStore } from "@/features/sport-center/stores/sport-center-store"
import type { BulkCourtAvailability } from "@/features/sport-center/types/court"
import type { Product } from "@/features/sport-center/types/product"
import type { Service } from "@/features/sport-center/types/service"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

export type SelectedCourts = Record<string, Set<string>>
export type ServiceSelectionState = Record<string, boolean>
export type ProductSelectionState = Record<string, number>

type BookingTotalSource = {
  selectedCourts: SelectedCourts
  courtAvailability: BulkCourtAvailability | null
  services: Service[]
  products: Product[]
  selectedServices: ServiceSelectionState
  selectedProducts: ProductSelectionState
}

function toAmount(value: number | string | null | undefined) {
  const normalized = Number(value ?? 0)
  return Number.isFinite(normalized) ? normalized : 0
}

export function calculateBookingTotal(state: BookingTotalSource) {
  const sportCenter = useSportCenterStore.getState().sportCenter
  const basePrice = toAmount(sportCenter?.basePrice)

  const totalCourtAmount = Object.entries(state.selectedCourts).reduce(
    (courtSum, [courtId, slots]) => {
      const court = state.courtAvailability?.courts.find(
        (item) => item.courtId === courtId
      )

      const slotTotal = Array.from(slots).reduce((slotSum, selectedSlot) => {
        const [startTime = "", endTime = ""] = selectedSlot.split(" - ")
        const slot = court?.slots.find(
          (availableSlot) =>
            availableSlot.startTime === startTime &&
            availableSlot.endTime === endTime
        )

        return slotSum + toAmount(slot?.pricePerHour ?? basePrice)
      }, 0)

      return courtSum + slotTotal
    },
    0
  )

  const serviceTotal = state.services.reduce((sum, service) => {
    if (!state.selectedServices[service.id]) return sum
    return sum + toAmount(service.price)
  }, 0)

  const productTotal = state.products.reduce((sum, product) => {
    const quantity = state.selectedProducts[product.id] ?? 0
    return sum + toAmount(product.price) * quantity
  }, 0)

  return totalCourtAmount + serviceTotal + productTotal
}

interface BookingStore {
  draftCenterId: string | null
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
  useCredit: boolean
  total: number
  isSubmitting: boolean
  submitMessage: string
  submitError: string
  lastBookingId: string | null
  initializeBooking: (centerId?: string) => void
  setSelectedDate: (date: Date | undefined) => void
  toggleCourtSlot: (courtId: string, slot: string) => void
  setSelectedServices: Dispatch<SetStateAction<ServiceSelectionState>>
  setSelectedProducts: Dispatch<SetStateAction<ProductSelectionState>>
  setBookingNote: (note: string) => void
  setUseCredit: (useCredit: boolean) => void
  clearSubmissionFeedback: () => void
  recalculateTotal: () => void
}

function getDefaultState() {
  return {
    draftCenterId: null,
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
    useCredit: false,
    total: 0,
    isSubmitting: false,
    submitMessage: "",
    submitError: "",
    lastBookingId: null,
  }
}

export const useBookingStore = create<BookingStore>((set, _get) => ({
  ...getDefaultState(),

  initializeBooking: (centerId) =>
    set((state) => {
      if (centerId && state.draftCenterId === centerId) {
        return state
      }

      return {
        ...getDefaultState(),
        draftCenterId: centerId ?? null,
      }
    }),

  setSelectedDate: (selectedDate) =>
    set((state) => {
      const nextState = {
        ...state,
        selectedDate,
        selectedCourts: {},
        submitMessage: "",
        submitError: "",
        lastBookingId: null,
      }

      return {
        selectedDate,
        selectedCourts: {},
        submitMessage: "",
        submitError: "",
        lastBookingId: null,
        total: calculateBookingTotal(nextState),
      }
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

      const nextState = {
        ...state,
        selectedCourts: nextSelectedCourts,
      }

      return {
        selectedCourts: nextSelectedCourts,
        total: calculateBookingTotal(nextState),
      }
    })
  },

  setSelectedServices: (nextSelection) => {
    set((state) => {
      const selectedServices =
        typeof nextSelection === "function"
          ? nextSelection(state.selectedServices)
          : nextSelection

      return {
        selectedServices,
        total: calculateBookingTotal({
          ...state,
          selectedServices,
        }),
      }
    })
  },

  setSelectedProducts: (nextSelection) => {
    set((state) => {
      const selectedProducts =
        typeof nextSelection === "function"
          ? nextSelection(state.selectedProducts)
          : nextSelection

      return {
        selectedProducts,
        total: calculateBookingTotal({
          ...state,
          selectedProducts,
        }),
      }
    })
  },

  setBookingNote: (bookingNote) => set({ bookingNote }),

  setUseCredit: (useCredit) => set({ useCredit }),

  clearSubmissionFeedback: () => set({ submitMessage: "", submitError: "" }),

  recalculateTotal: () =>
    set((state) => ({
      total: calculateBookingTotal(state),
    })),
}))

export type { BookingStore }
