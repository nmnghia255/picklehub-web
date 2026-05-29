"use client"

import type { Dispatch, SetStateAction } from "react"
import { create } from "zustand"

import { createSportCenterBookingsAction } from "@/features/sport-center/actions/create-booking"
import { fetchBulkCourtAvailabilityAction } from "@/features/sport-center/actions/fetch-bulk-court-availability"
import { fetchSportCenterProductsAction } from "@/features/sport-center/actions/fetch-sport-center-products"
import { fetchSportCenterServicesAction } from "@/features/sport-center/actions/fetch-sport-center-services"
import type { CreateBookingRequest } from "@/features/sport-center/types/booking"
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
  fetchCourtAvailability: (centerId: string, date: Date) => Promise<void>
  fetchServices: (centerId: string) => Promise<void>
  fetchProducts: (centerId: string) => Promise<void>
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

function buildBookingRequest(
  selectedDate: Date,
  selectedCourts: SelectedCourts,
  selectedServices: ServiceSelectionState,
  selectedProducts: ProductSelectionState,
  bookingNote: string,
  services: Service[],
  products: Product[],
  availability: BulkCourtAvailability | null,
  basePrice: number
): CreateBookingRequest {
  const bookingDate = formatBookingDate(selectedDate)

  const serviceItems = services
    .filter((service) => selectedServices[service.id])
    .map((service) => ({ serviceId: service.id, quantity: 1 }))

  const productItems = products
    .map((product) => ({
      productId: product.id,
      quantity: selectedProducts[product.id] ?? 0,
      name: product.name,
    }))
    .filter((item) => item.quantity > 0)

  const selectedServiceNames = services
    .filter((service) => selectedServices[service.id])
    .map((service) => service.name)

  const selectedProductLines = productItems.map(
    (item) => `${item.name} x${item.quantity}`
  )

  const noteParts = [bookingNote.trim()]

  if (selectedServiceNames.length > 0) {
    noteParts.push(`Dịch vụ: ${selectedServiceNames.join(", ")}`)
  }

  if (selectedProductLines.length > 0) {
    noteParts.push(`Sản phẩm: ${selectedProductLines.join(", ")}`)
  }

  const note = noteParts.filter(Boolean).join("\n")

  const courtItems = Object.entries(selectedCourts).flatMap(
    ([courtId, slots]) =>
      Array.from(slots).map((slot) => {
        const { startTime, endTime } = parseBookingSlot(slot)
        const availabilityCourt = availability?.courts.find(
          (court) => court.courtId === courtId
        )
        const availabilitySlot = availabilityCourt?.slots.find(
          (item) => item.startTime === startTime && item.endTime === endTime
        )
        const pricePerHour = availabilitySlot?.pricePerHour ?? basePrice

        return {
          courtId: courtId.toString(),
          courtName: availabilityCourt?.courtName ?? `Sân ${courtId}`,
          startTime,
          endTime,
          durationHours: 1,
          breakdown: [
            {
              startTime,
              endTime,
              pricePerHour,
            },
          ],
          courtPrice: pricePerHour,
        }
      })
  )

  return {
    date: bookingDate,
    note,
    phoneNumber: "",
    useCredit: false,
    serviceItems,
    productItems: productItems.map(({ productId, quantity }) => ({
      productId,
      quantity,
    })),
    courtItems,
  }
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
      const services = (await fetchSportCenterServicesAction(centerId)).filter(
        (service) => service.isActive
      )
      const selectedServices = services.reduce<ServiceSelectionState>(
        (acc, service) => {
          acc[service.id] = false
          return acc
        },
        {}
      )

      set({ services, selectedServices })
    } catch {
      set({ services: [], selectedServices: {} })
    }
  },

  fetchProducts: async (centerId) => {
    try {
      const products = (await fetchSportCenterProductsAction(centerId)).filter(
        (product) => product.isActive
      )
      const selectedProducts = products.reduce<ProductSelectionState>(
        (acc, product) => {
          acc[product.id] = 0
          return acc
        },
        {}
      )

      set({ products, selectedProducts })
    } catch {
      set({ products: [], selectedProducts: {} })
    }
  },

  submitBookings: async () => {
    const {
      centerId,
      selectedDate,
      selectedCourts,
      selectedServices,
      selectedProducts,
      bookingNote,
      services,
      products,
      courtAvailability,
      sportCenter,
    } = get()

    if (!centerId) {
      set({ submitError: "Không tìm thấy mã sân." })
      return false
    }

    if (!selectedDate) {
      set({ submitError: "Vui lòng chọn ngày đặt sân." })
      return false
    }

    const bookingRequest = buildBookingRequest(
      selectedDate,
      selectedCourts,
      selectedServices,
      selectedProducts,
      bookingNote,
      services,
      products,
      courtAvailability,
      sportCenter?.basePrice ?? 0
    )

    if (bookingRequest.courtItems.length === 0) {
      set({ submitError: "Vui lòng chọn ít nhất một sân và khung giờ." })
      return false
    }

    set({
      isSubmitting: true,
      submitMessage: "",
      submitError: "",
      lastBookingId: null,
    })

    try {
      const result = await createSportCenterBookingsAction({
        centerId,
        bookingRequest,
      })

      if (!result.success) {
        set({ submitError: result.error ?? "Không thể gửi yêu cầu đặt sân." })
        return false
      }

      set({
        selectedCourts: {},
        selectedServices: services.reduce<ServiceSelectionState>(
          (acc, service) => {
            acc[service.id] = false
            return acc
          },
          {}
        ),
        selectedProducts: products.reduce<ProductSelectionState>(
          (acc, product) => {
            acc[product.id] = 0
            return acc
          },
          {}
        ),
        bookingNote: "",
        lastBookingId: result.booking?.id ?? null,
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
