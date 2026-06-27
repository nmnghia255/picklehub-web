import { create } from "zustand"

import type { BulkCourtAvailability } from "@/features/sport-center/types/court"
import type { SportCenter } from "@/features/sport-center/types/sport-center"
import { createTournamentBookingsAction } from "@/features/tournaments/actions/booking-actions"
import type {
  CreateTournamentBookingResponse,
  TournamentBookingRequest,
} from "@/features/tournaments/types/booking"

interface BookingState {
  // States
  tournamentId: number | null
  centerId: string | null
  sportCenter: SportCenter | null
  selectedDate: Date | undefined
  courtAvailability: BulkCourtAvailability | null
  uniqueSlotKeys: string[]
  selectedCourts: Record<string, Set<string>>
  playerName: string
  phoneNumber: string

  isLoadingCenter: boolean
  isLoadingAvailability: boolean
  availabilityError: string
  isSubmitting: boolean
  isConfirmDialogOpen: boolean
  file: File | null
  previewUrl: string

  // Actions
  setTournamentId: (id: number | null) => void
  setCenterId: (id: string | null) => void
  setSportCenter: (center: SportCenter | null) => void
  setSelectedDate: (date: Date | undefined) => void
  setCourtAvailability: (availability: BulkCourtAvailability | null) => void
  setSelectedCourts: (courts: Record<string, Set<string>>) => void
  setPlayerName: (name: string) => void
  setPhoneNumber: (phone: string) => void
  setIsLoadingCenter: (loading: boolean) => void
  setIsLoadingAvailability: (loading: boolean) => void
  setAvailabilityError: (error: string) => void
  setIsConfirmDialogOpen: (open: boolean) => void
  setFile: (file: File | null) => void
  setPreviewUrl: (url: string) => void
  setSubmitting: (submitting: boolean) => void
  toggleSlot: (courtId: string, slotKey: string) => void
  submitBooking: () => Promise<{
    success: boolean
    data?: CreateTournamentBookingResponse
    error?: string
  }>
  reset: () => void
}

export const useBookingStore = create<BookingState>((set, get) => ({
  tournamentId: null,
  centerId: null,
  sportCenter: null,
  selectedDate: new Date(),
  courtAvailability: null,
  uniqueSlotKeys: [],
  selectedCourts: {},
  playerName: "",
  phoneNumber: "",
  isLoadingCenter: true,
  isLoadingAvailability: false,
  availabilityError: "",
  isSubmitting: false,
  isConfirmDialogOpen: false,
  file: null,
  previewUrl: "",

  setTournamentId: (tournamentId) => set({ tournamentId }),
  setCenterId: (centerId) => set({ centerId }),
  setSportCenter: (sportCenter) => set({ sportCenter }),
  setSelectedDate: (selectedDate) => set({ selectedDate, selectedCourts: {} }), // resets selection on date change
  setCourtAvailability: (courtAvailability) => {
    if (!courtAvailability || courtAvailability.courts.length === 0) {
      set({ courtAvailability, uniqueSlotKeys: [] })
      return
    }
    const keysSet = new Set<string>()
    courtAvailability.courts.forEach((court) => {
      court.slots.forEach((slot) => {
        keysSet.add(`${slot.startTime} - ${slot.endTime}`)
      })
    })
    const uniqueSlotKeys = Array.from(keysSet).sort((a, b) => {
      const startA = a.split(" - ")[0] || ""
      const startB = b.split(" - ")[0] || ""
      return startA.localeCompare(startB)
    })
    set({ courtAvailability, uniqueSlotKeys })
  },
  setSelectedCourts: (selectedCourts) => set({ selectedCourts }),
  setPlayerName: (playerName) => set({ playerName }),
  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  setIsLoadingCenter: (isLoadingCenter) => set({ isLoadingCenter }),
  setIsLoadingAvailability: (isLoadingAvailability) =>
    set({ isLoadingAvailability }),
  setAvailabilityError: (availabilityError) => set({ availabilityError }),
  setIsConfirmDialogOpen: (isConfirmDialogOpen) => set({ isConfirmDialogOpen }),
  setFile: (file) => set({ file }),
  setPreviewUrl: (previewUrl) => set({ previewUrl }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  toggleSlot: (courtId, slotKey) => {
    const { selectedCourts } = get()
    const nextCourts = { ...selectedCourts }

    if (!nextCourts[courtId]) {
      nextCourts[courtId] = new Set()
    } else {
      nextCourts[courtId] = new Set(nextCourts[courtId])
    }

    if (nextCourts[courtId].has(slotKey)) {
      nextCourts[courtId].delete(slotKey)
      if (nextCourts[courtId].size === 0) {
        delete nextCourts[courtId]
      }
    } else {
      nextCourts[courtId].add(slotKey)
    }

    set({ selectedCourts: nextCourts })
  },

  submitBooking: async () => {
    const {
      tournamentId,
      centerId,
      selectedDate,
      playerName,
      phoneNumber,
      selectedCourts,
    } = get()
    if (
      !tournamentId ||
      !centerId ||
      !selectedDate ||
      !playerName.trim() ||
      !phoneNumber.trim()
    ) {
      return { success: false, error: "Missing required information" }
    }

    const items: Array<{
      courtId: string
      startTime: string
      endTime: string
    }> = []
    Object.entries(selectedCourts).forEach(([courtId, slots]) => {
      slots.forEach((slotKey) => {
        const [startTime = "", endTime = ""] = slotKey.split(" - ")
        items.push({
          courtId,
          startTime,
          endTime,
        })
      })
    })

    if (items.length === 0) {
      return { success: false, error: "Please select at least one slot" }
    }

    set({ isSubmitting: true })
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0]
      const requestPayload: TournamentBookingRequest = {
        centerId,
        date: formattedDate!,
        playerName,
        phoneNumber,
        items,
      }

      const res = await createTournamentBookingsAction(
        tournamentId,
        requestPayload
      )
      set({ isSubmitting: false })
      if (res.success) {
        set({ selectedCourts: {}, isConfirmDialogOpen: false })
        return { success: true, data: res.data }
      } else {
        return {
          success: false,
          error: res.error || "Failed to book court slots",
        }
      }
    } catch (err) {
      console.error(err)
      set({ isSubmitting: false })
      return {
        success: false,
        error: "An unexpected error occurred while booking",
      }
    }
  },

  reset: () =>
    set({
      tournamentId: null,
      centerId: null,
      sportCenter: null,
      selectedDate: new Date(),
      courtAvailability: null,
      uniqueSlotKeys: [],
      selectedCourts: {},
      playerName: "",
      phoneNumber: "",
      isLoadingCenter: true,
      isLoadingAvailability: false,
      availabilityError: "",
      isSubmitting: false,
      isConfirmDialogOpen: false,
      file: null,
      previewUrl: "",
    }),
}))

// Selector helpers for computed fields to prevent duplicate calculation and excessive re-renders
export const useSelectedDateText = () =>
  useBookingStore((s) => {
    const { selectedDate } = s
    if (!selectedDate) return ""
    const day = String(selectedDate.getDate()).padStart(2, "0")
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
    const year = selectedDate.getFullYear()
    return `${day}/${month}/${year}`
  })

export const useTotalSlotsCount = () =>
  useBookingStore((s) => {
    return Object.values(s.selectedCourts).reduce(
      (sum, slots) => sum + slots.size,
      0
    )
  })

export const useTotalPrice = () =>
  useBookingStore((s) => {
    const { courtAvailability, selectedCourts, sportCenter } = s
    if (!courtAvailability) return 0
    let sum = 0
    Object.entries(selectedCourts).forEach(([courtId, slots]) => {
      const court = courtAvailability.courts.find((c) => c.courtId === courtId)
      slots.forEach((slotKey) => {
        const [startTime = "", endTime = ""] = slotKey.split(" - ")
        const slot = court?.slots.find(
          (s) => s.startTime === startTime && s.endTime === endTime
        )
        sum += slot?.pricePerHour ?? sportCenter?.basePrice ?? 0
      })
    })
    return sum
  })

export const useUniqueSlotKeys = () => useBookingStore((s) => s.uniqueSlotKeys)
