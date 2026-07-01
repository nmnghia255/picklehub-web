import { create } from "zustand"

import type { BulkCourtAvailability } from "@/features/sport-center/types/court"
import type { SportCenter } from "@/features/sport-center/types/sport-center"
import { createTournamentBookingsAction } from "@/features/tournaments/actions/booking-actions"
import type {
  CreateTournamentBookingResponse,
  TournamentBookingRequest,
} from "@/features/tournaments/types/booking"
import type { TournamentEvent } from "@/features/tournaments/types/tournament-event"

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// selectedCourts: dateKey -> courtId -> Set<slotKey>
type SelectedCourtsMap = Record<string, Record<string, Set<string>>>

interface BookingState {
  // States
  tournamentId: number | null
  centerId: string | null
  sportCenter: SportCenter | null
  /** The event the host is booking courts for */
  selectedEvent: TournamentEvent | null
  /** The set of dates the user has chosen to book on */
  selectedDates: Date[]
  /** The date currently being viewed/edited in the grid */
  activeDate: Date | undefined
  courtAvailability: BulkCourtAvailability | null
  uniqueSlotKeys: string[]
  /** dateKey -> courtId -> Set<slotKey> */
  selectedCourts: SelectedCourtsMap
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
  setSelectedEvent: (event: TournamentEvent | null) => void
  /** Toggle a date in/out of selectedDates; also manages activeDate */
  toggleSelectedDate: (date: Date) => void
  /** Set the active (viewed) date in the grid */
  setActiveDate: (date: Date | undefined) => void
  setCourtAvailability: (availability: BulkCourtAvailability | null) => void
  setSelectedCourts: (courts: SelectedCourtsMap) => void
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
  selectedEvent: null,
  selectedDates: [new Date()],
  activeDate: new Date(),
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
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),

  toggleSelectedDate: (date) => {
    const { selectedDates, selectedCourts, activeDate } = get()
    const dateKey = formatDateKey(date)
    const existingIdx = selectedDates.findIndex(
      (d) => formatDateKey(d) === dateKey
    )

    if (existingIdx >= 0) {
      // Remove the date
      const newDates = selectedDates.filter((_, i) => i !== existingIdx)
      // Also remove any selections for this date
      const newCourts = { ...selectedCourts }
      delete newCourts[dateKey]

      // If removed date was the active date, switch to first remaining
      const newActive =
        activeDate && formatDateKey(activeDate) === dateKey
          ? newDates[0]
          : activeDate

      set({
        selectedDates: newDates,
        selectedCourts: newCourts,
        activeDate: newActive,
        // Reset grid data if active date changed
        courtAvailability:
          newActive &&
          activeDate &&
          formatDateKey(newActive) !== formatDateKey(activeDate)
            ? null
            : get().courtAvailability,
        uniqueSlotKeys:
          newActive &&
          activeDate &&
          formatDateKey(newActive) !== formatDateKey(activeDate)
            ? []
            : get().uniqueSlotKeys,
      })
    } else {
      // Add the date, make it the active date
      set({
        selectedDates: [...selectedDates, date],
        activeDate: date,
        // Reset availability so it loads for the new date
        courtAvailability: null,
        uniqueSlotKeys: [],
      })
    }
  },

  setActiveDate: (activeDate) =>
    set({ activeDate, courtAvailability: null, uniqueSlotKeys: [] }),

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
    const { selectedCourts, activeDate } = get()
    if (!activeDate) return

    const dateKey = formatDateKey(activeDate)
    const nextCourts = { ...selectedCourts }

    if (!nextCourts[dateKey]) {
      nextCourts[dateKey] = {}
    } else {
      nextCourts[dateKey] = { ...nextCourts[dateKey] }
    }

    if (!nextCourts[dateKey][courtId]) {
      nextCourts[dateKey][courtId] = new Set()
    } else {
      nextCourts[dateKey][courtId] = new Set(nextCourts[dateKey][courtId])
    }

    if (nextCourts[dateKey][courtId].has(slotKey)) {
      nextCourts[dateKey][courtId].delete(slotKey)
      if (nextCourts[dateKey][courtId].size === 0) {
        delete nextCourts[dateKey][courtId]
      }
      if (Object.keys(nextCourts[dateKey]).length === 0) {
        delete nextCourts[dateKey]
      }
    } else {
      nextCourts[dateKey][courtId].add(slotKey)
    }

    set({ selectedCourts: nextCourts })
  },

  submitBooking: async () => {
    const { tournamentId, centerId, playerName, phoneNumber, selectedCourts } =
      get()
    if (
      !tournamentId ||
      !centerId ||
      !playerName.trim() ||
      !phoneNumber.trim()
    ) {
      return { success: false, error: "Missing required information" }
    }

    // Build bookingGroups from selectedCourts (dateKey -> courtId -> slots)
    const bookings: Array<{
      date: string
      items: Array<{ courtId: string; startTime: string; endTime: string }>
    }> = []

    Object.entries(selectedCourts).forEach(([dateKey, courts]) => {
      const items: Array<{
        courtId: string
        startTime: string
        endTime: string
      }> = []
      Object.entries(courts).forEach(([courtId, slots]) => {
        slots.forEach((slotKey) => {
          const [startTime = "", endTime = ""] = slotKey.split(" - ")
          items.push({ courtId, startTime, endTime })
        })
      })
      if (items.length > 0) {
        bookings.push({ date: dateKey, items })
      }
    })

    if (bookings.length === 0) {
      return { success: false, error: "Please select at least one slot" }
    }

    set({ isSubmitting: true })
    try {
      const requestPayload: TournamentBookingRequest = {
        centerId,
        bookings,
        playerName,
        phoneNumber,
      }

      const res = await createTournamentBookingsAction(
        tournamentId,
        requestPayload
      )
      set({ isSubmitting: false })
      if (res.success) {
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
      selectedEvent: null,
      selectedDates: [new Date()],
      activeDate: new Date(),
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

export const useActiveDateKey = () =>
  useBookingStore((s) =>
    s.activeDate ? formatDateKey(s.activeDate) : undefined
  )

export const useSelectedDateText = (
  t?: (key: string, options?: Record<string, unknown>) => string
) =>
  useBookingStore((s) => {
    const { selectedDates, selectedCourts } = s
    const bookedDates = selectedDates.filter((date) => {
      const key = formatDateKey(date)
      return (
        selectedCourts[key] &&
        Object.values(selectedCourts[key]).some((slots) => slots.size > 0)
      )
    })

    if (bookedDates.length === 0) return ""
    if (bookedDates.length === 1) {
      const d = bookedDates[0]!
      const day = String(d.getDate()).padStart(2, "0")
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    }
    if (t) {
      return t("booking.page.selectedDatesCount", {
        count: bookedDates.length,
        defaultValue: `${bookedDates.length} dates selected`,
      })
    }
    return `${bookedDates.length} dates selected`
  })

export const useActiveDateText = () =>
  useBookingStore((s) => {
    const { activeDate } = s
    if (!activeDate) return ""
    const day = String(activeDate.getDate()).padStart(2, "0")
    const month = String(activeDate.getMonth() + 1).padStart(2, "0")
    const year = activeDate.getFullYear()
    return `${day}/${month}/${year}`
  })

export const useTotalSlotsCount = () =>
  useBookingStore((s) => {
    return Object.values(s.selectedCourts).reduce((sum, courts) => {
      return (
        sum +
        Object.values(courts).reduce(
          (courtSum, slots) => courtSum + slots.size,
          0
        )
      )
    }, 0)
  })

export const useTotalPrice = () =>
  useBookingStore((s) => {
    const { courtAvailability, selectedCourts, sportCenter, activeDate } = s
    // Price calculation: use courtAvailability for slots on active date,
    // fall back to sportCenter base price for other dates
    let sum = 0
    Object.entries(selectedCourts).forEach(([dateKey, courts]) => {
      const isActiveDate = activeDate && formatDateKey(activeDate) === dateKey
      Object.entries(courts).forEach(([courtId, slots]) => {
        const court =
          isActiveDate && courtAvailability
            ? courtAvailability.courts.find((c) => c.courtId === courtId)
            : undefined
        slots.forEach((slotKey) => {
          const [startTime = "", endTime = ""] = slotKey.split(" - ")
          const slot = court?.slots.find(
            (s) => s.startTime === startTime && s.endTime === endTime
          )
          const price = slot?.pricePerHour ?? sportCenter?.basePrice ?? 0
          sum += Number(price)
        })
      })
    })
    return sum
  })

export const useUniqueSlotKeys = () => useBookingStore((s) => s.uniqueSlotKeys)

/** Stable empty fallback — reusing the same reference prevents Zustand from
 *  treating `{}` as a "new" value on every selector call (Object.is would fail). */
const EMPTY_COURTS: Record<string, Set<string>> = {}

/** Returns selectedCourts for the currently active date only */
export const useActiveDateSelectedCourts = () =>
  useBookingStore((s) => {
    const { activeDate, selectedCourts } = s
    if (!activeDate) return EMPTY_COURTS
    const dateKey = formatDateKey(activeDate)
    return selectedCourts[dateKey] ?? EMPTY_COURTS
  })
