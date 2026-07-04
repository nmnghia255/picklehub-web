import { create } from "zustand"

import { getTournamentCentersAction } from "../actions/booking-actions"
import {
  assignRefereeToMatchAction,
  unassignRefereeFromMatchAction,
} from "../actions/referee-actions"
import {
  getAvailableCourtsAction,
  getBookedSlotsAction,
  getTournamentFixturesWithScheduleAction,
  linkBookingItemToFixtureAction,
  unlinkBookingItemFromFixtureAction,
} from "../actions/schedule-actions"
import type { BookingItemResponse, TournamentBooking } from "../types/booking"
import type { Match, MatchWarning } from "../types/match"
import type {
  AutoScheduleConfigDto,
  PreviewAssignment,
} from "../types/schedule"
import type { TournamentCenter } from "../types/tournament-center"
import type { CourtInfo, TournamentCourt } from "../types/tournament-court"
import type { TournamentEvent } from "../types/tournament-event"

interface FixtureRawData {
  id: number | string
  eventId?: number | null
  event?: string | null
  round?: string | null
  team1?: { name: string } | string | null
  team2?: { name: string } | string | null
  winner?: string | number | null
  score?: string | null
  status?: string | null
  court?: string | null
  courtId?: string | null
  courtStatus?: string | null
  time?: string | null
  startTime?: string | null
  duration?: number | null
  priority?: string | null
  refereeId?: string | null
  refereeName?: string | null
  bookingId?: string | number | null
  bookingItemId?: string | null
  warnings?: MatchWarning[] | null
}

// Helper function to compute stable arrays from state
const computeDerivations = (
  fixtures: Match[],
  selectedEventId: string,
  selectedCenterId: string,
  selectedDate: string,
  bookings: TournamentBooking[]
) => {
  const unscheduledMatches = fixtures.filter(
    (m) =>
      !m.court &&
      (!selectedEventId ||
        selectedEventId === "all" ||
        m.eventId?.toString() === selectedEventId)
  )

  const scheduledMatches = fixtures.filter(
    (m) =>
      m.court &&
      (!selectedEventId ||
        selectedEventId === "all" ||
        m.eventId?.toString() === selectedEventId)
  )

  // Filter bookings for the selected center and selected date that are active (not CANCELLED or EXPIRED)
  const centerBookings = bookings.filter(
    (b) =>
      b.centerId === selectedCenterId &&
      b.date &&
      (b.date === selectedDate || b.date.startsWith(selectedDate)) &&
      b.statusMirror &&
      b.statusMirror.toUpperCase() !== "CANCELLED" &&
      b.statusMirror.toUpperCase() !== "EXPIRED"
  )

  // Extract unique court objects from these bookings' items
  const uniqueCourtsMap: Record<string, string> = {}
  centerBookings
    .flatMap((b) => b.items || [])
    .forEach((item) => {
      if (item.courtId && item.court?.name) {
        uniqueCourtsMap[item.courtId] = item.court.name
      }
    })

  const courtsList: CourtInfo[] = Object.entries(uniqueCourtsMap).map(
    ([courtId, courtName]) => ({ courtId, courtName })
  )

  return { unscheduledMatches, scheduledMatches, courtsList }
}

interface SchedulingState {
  tournamentId: number | null
  fixtures: Match[]
  bookings: TournamentBooking[]
  centers: TournamentCenter[]
  availableCourts: TournamentCourt[]
  events: TournamentEvent[]
  isLoading: boolean
  selectedDate: string
  selectedEventId: string
  selectedCenterId: string

  // Cached derivations
  unscheduledMatches: Match[]
  scheduledMatches: Match[]
  courtsList: CourtInfo[]

  // Modals state
  showAutoSchedule: boolean
  showAssignReferee: boolean
  selectedMatchForReferee: Match | null
  showManualSchedule: boolean
  selectedMatchForManual: Match | null

  // Setters
  setTournamentId: (id: number | null) => void
  setEvents: (events: TournamentEvent[]) => void
  setSelectedDate: (date: string) => void
  setSelectedEventId: (eventId: string) => void
  setSelectedCenterId: (centerId: string) => void
  setShowAutoSchedule: (show: boolean) => void
  setShowAssignReferee: (show: boolean) => void
  setSelectedMatchForReferee: (match: Match | null) => void
  setShowManualSchedule: (show: boolean) => void
  setSelectedMatchForManual: (match: Match | null) => void

  // Preview state
  autoScheduleConfig: AutoScheduleConfigDto | null
  previewAssignments: PreviewAssignment[]
  previewWarnings: string[]
  previewEventId: string | null
  isPreviewMode: boolean
  viewMode: "normal" | "preview"
  setViewMode: (viewMode: "normal" | "preview") => void
  setPreview: (
    config: AutoScheduleConfigDto,
    assignments: PreviewAssignment[],
    eventId: string,
    warnings: string[]
  ) => void
  clearPreview: () => void
  updatePreviewAssignment: (
    matchId: number | string,
    updates: {
      bookingId: number
      bookingItemId: string
      courtName: string
      startTime: string
      endTime: string
    }
  ) => void

  // Actions
  loadSchedule: () => Promise<void>
  loadAvailableCourts: () => Promise<void>
  unscheduleMatch: (
    fixtureId: string
  ) => Promise<{ success: boolean; error?: string }>
  assignReferee: (
    refereeId: string
  ) => Promise<{ success: boolean; error?: string }>
  unassignReferee: (
    fixtureId: string
  ) => Promise<{ success: boolean; error?: string }>
  manualSchedule: (
    courtId: string,
    timeSlot: string
  ) => Promise<{ success: boolean; error?: string }>
  reset: () => void
}

export const useSchedulingStore = create<SchedulingState>((set, get) => ({
  tournamentId: null,
  fixtures: [],
  bookings: [],
  centers: [],
  availableCourts: [],
  events: [],
  isLoading: true,
  selectedDate: "",
  selectedEventId: "all",
  selectedCenterId: "",

  unscheduledMatches: [],
  scheduledMatches: [],
  courtsList: [],

  showAutoSchedule: false,
  showAssignReferee: false,
  selectedMatchForReferee: null,
  showManualSchedule: false,
  selectedMatchForManual: null,

  autoScheduleConfig: null,
  previewAssignments: [],
  previewWarnings: [],
  previewEventId: null,
  isPreviewMode: false,
  viewMode: "normal",
  setViewMode: (viewMode) => set({ viewMode }),
  setPreview: (
    autoScheduleConfig,
    previewAssignments,
    previewEventId,
    previewWarnings
  ) =>
    set({
      autoScheduleConfig,
      previewAssignments,
      previewWarnings,
      previewEventId,
      isPreviewMode: true,
      viewMode: "preview",
    }),
  clearPreview: () =>
    set({
      autoScheduleConfig: null,
      previewAssignments: [],
      previewWarnings: [],
      previewEventId: null,
      isPreviewMode: false,
      viewMode: "normal",
    }),
  updatePreviewAssignment: (matchId, updates) =>
    set((state) => ({
      previewAssignments: state.previewAssignments.map((a) =>
        a.matchId.toString() === matchId.toString() ? { ...a, ...updates } : a
      ),
    })),

  setTournamentId: (tournamentId) => set({ tournamentId }),
  setEvents: (events) => set({ events }),
  setSelectedDate: (selectedDate) => {
    const current = get().selectedDate
    if (current === selectedDate) return
    set({ selectedDate })
    get().loadSchedule()
  },
  setSelectedCenterId: (selectedCenterId) => {
    const current = get().selectedCenterId
    if (current === selectedCenterId) return
    set({ selectedCenterId })
    get().loadSchedule()
  },
  setSelectedEventId: (selectedEventId) => {
    const { fixtures, selectedCenterId, selectedDate, bookings } = get()
    const derivations = computeDerivations(
      fixtures,
      selectedEventId,
      selectedCenterId,
      selectedDate,
      bookings
    )
    set({ selectedEventId, ...derivations })
  },
  setShowAutoSchedule: (showAutoSchedule) => set({ showAutoSchedule }),
  setShowAssignReferee: (showAssignReferee) => set({ showAssignReferee }),
  setSelectedMatchForReferee: (selectedMatchForReferee) =>
    set({ selectedMatchForReferee }),
  setShowManualSchedule: (showManualSchedule) => set({ showManualSchedule }),
  setSelectedMatchForManual: (selectedMatchForManual) =>
    set({ selectedMatchForManual }),

  loadSchedule: async () => {
    const {
      tournamentId,
      selectedEventId,
      selectedCenterId,
      selectedDate,
      events,
    } = get()
    if (!tournamentId) return

    set({ isLoading: true })
    try {
      const [fixturesRes, centersRes] = await Promise.all([
        getTournamentFixturesWithScheduleAction(tournamentId),
        getTournamentCentersAction(tournamentId.toString()),
      ])

      let loadedCenters: TournamentCenter[] = []
      let newCenterId = selectedCenterId

      if (centersRes.success && centersRes.data) {
        const rawCenters = centersRes.data
        loadedCenters = Array.isArray(rawCenters)
          ? rawCenters
          : rawCenters &&
              typeof rawCenters === "object" &&
              "centers" in rawCenters &&
              Array.isArray((rawCenters as Record<string, unknown>).centers)
            ? ((rawCenters as Record<string, unknown>)
                .centers as TournamentCenter[])
            : rawCenters &&
                typeof rawCenters === "object" &&
                "data" in rawCenters &&
                Array.isArray((rawCenters as Record<string, unknown>).data)
              ? ((rawCenters as Record<string, unknown>)
                  .data as TournamentCenter[])
              : []
      }

      // If selectedCenterId is not set, default to first center
      if (!newCenterId && loadedCenters.length > 0) {
        newCenterId = loadedCenters[0].centerId
      }

      let loadedBookings: TournamentBooking[] = []
      if (newCenterId && selectedDate) {
        const bookedRes = await getBookedSlotsAction(
          tournamentId,
          newCenterId,
          selectedDate
        )
        if (bookedRes.success && bookedRes.data) {
          const rawBooked = bookedRes.data as unknown as BookingItemResponse[]

          const slotsByBookingId: Record<
            number,
            {
              bookingId: number
              centerId: string
              date: string
              items: NonNullable<TournamentBooking["items"]>
            }
          > = {}

          rawBooked.forEach((item) => {
            const bId = item.bookingId || 1
            const centerVal = newCenterId
            const dateVal = item.date || selectedDate

            if (!slotsByBookingId[bId]) {
              slotsByBookingId[bId] = {
                bookingId: bId,
                centerId: centerVal,
                date: dateVal,
                items: [],
              }
            }

            slotsByBookingId[bId].items.push({
              id: item.bookingItemId,
              courtId: item.courtId,
              startTime: item.startTime,
              endTime: item.endTime,
              court: {
                id: item.courtId,
                name: item.courtName,
              },
            })
          })

          loadedBookings = Object.values(slotsByBookingId).map((group) => ({
            id: group.bookingId,
            tournamentId: Number(tournamentId),
            externalBookingId: "",
            centerId: group.centerId,
            date: group.date,
            statusMirror: "CONFIRMED",
            totalPrice: null,
            createdAt: "",
            updatedAt: "",
            items: group.items,
          }))
        }
      }

      let rawFixtures: FixtureRawData[] = []
      if (fixturesRes.success && fixturesRes.data) {
        const res = fixturesRes
        if (Array.isArray(res.data)) {
          rawFixtures = res.data
        } else if (res.data && typeof res.data === "object") {
          if (
            "fixtures" in res.data &&
            Array.isArray((res.data as Record<string, unknown>).fixtures)
          ) {
            rawFixtures = (res.data as Record<string, unknown>)
              .fixtures as FixtureRawData[]
          } else if (
            "data" in res.data &&
            Array.isArray((res.data as Record<string, unknown>).data)
          ) {
            rawFixtures = (res.data as Record<string, unknown>)
              .data as FixtureRawData[]
          }
        }
      }

      const mappedMatches: Match[] = rawFixtures.map((f) => {
        let startTime = f.startTime || undefined
        let courtName = f.court || undefined

        if (f.bookingId && f.bookingItemId) {
          const booking = loadedBookings.find(
            (b) => b.id === Number(f.bookingId)
          )
          if (booking) {
            const item = booking.items?.find((i) => i.id === f.bookingItemId)
            if (item) {
              if (booking.date && item.startTime) {
                startTime = `${booking.date}T${item.startTime}`
              }
              if (item.court?.name) {
                courtName = item.court.name
              }
            }
          }
        }

        let eventId = f.eventId || 0
        if (f.event && events && events.length > 0) {
          const foundEvent = events.find(
            (e) => e.name.toLowerCase() === f.event?.toLowerCase()
          )
          if (foundEvent) {
            eventId = foundEvent.id
          }
        }

        return {
          id: f.id,
          tournamentId: tournamentId,
          eventId: eventId,
          event: f.event,
          round: f.round,
          team1:
            typeof f.team1 === "object" && f.team1
              ? f.team1
              : { name: (f.team1 as string) || "TBD" },
          team2:
            typeof f.team2 === "object" && f.team2
              ? f.team2
              : { name: (f.team2 as string) || "TBD" },
          winner: f.winner,
          score: f.score,
          status: f.status || "pending",
          court: courtName,
          courtId: f.courtId,
          courtStatus: f.courtStatus,
          time: f.time,
          startTime: startTime,
          duration: f.duration || 45,
          priority: f.priority || "medium",
          refereeId: f.refereeId,
          refereeName: f.refereeName,
          bookingId: f.bookingId ? Number(f.bookingId) : null,
          bookingItemId: f.bookingItemId,
          warnings: f.warnings || [],
        }
      })

      const derivations = computeDerivations(
        mappedMatches,
        selectedEventId,
        newCenterId,
        selectedDate,
        loadedBookings
      )

      set({
        fixtures: mappedMatches,
        bookings: loadedBookings,
        centers: loadedCenters,
        selectedCenterId: newCenterId,
        ...derivations,
      })
    } catch (err) {
      console.error(err)
    } finally {
      set({ isLoading: false })
    }
  },

  loadAvailableCourts: async () => {
    const { tournamentId, selectedCenterId, selectedDate } = get()
    if (!tournamentId || !selectedCenterId || !selectedDate) {
      set({ availableCourts: [], courtsList: [] })
      return
    }

    try {
      const res = await getAvailableCourtsAction(
        tournamentId,
        selectedCenterId,
        selectedDate
      )
      if (res.success && res.data) {
        const rawCourts = res.data
        const availableCourts = Array.isArray(rawCourts)
          ? rawCourts
          : rawCourts && typeof rawCourts === "object"
            ? [rawCourts as TournamentCourt]
            : []

        // Extract unique court objects from availableCourts
        const uniqueCourtsMap: Record<string, string> = {}
        availableCourts
          .flatMap((tc) => tc.courts || [])
          .forEach((c) => {
            if (c.courtId && c.courtName) {
              uniqueCourtsMap[c.courtId] = c.courtName
            }
          })

        const courtsList: CourtInfo[] = Object.entries(uniqueCourtsMap).map(
          ([courtId, courtName]) => ({ courtId, courtName })
        )

        set({ availableCourts, courtsList })
      } else {
        set({ availableCourts: [], courtsList: [] })
      }
    } catch (err) {
      console.error("Error loading available courts:", err)
      set({ availableCourts: [], courtsList: [] })
    }
  },

  unscheduleMatch: async (fixtureId) => {
    const { tournamentId, loadSchedule } = get()
    if (!tournamentId) return { success: false, error: "Missing tournament ID" }

    try {
      const res = await unlinkBookingItemFromFixtureAction(
        tournamentId,
        fixtureId
      )
      if (res.success) {
        await loadSchedule()
        return { success: true }
      }
      return {
        success: false,
        error: res.error || "Failed to unschedule match",
      }
    } catch (err) {
      console.error(err)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  assignReferee: async (refereeId) => {
    const { tournamentId, selectedMatchForReferee, loadSchedule } = get()
    if (!tournamentId || !selectedMatchForReferee) {
      return { success: false, error: "Missing required details" }
    }

    try {
      const res = await assignRefereeToMatchAction(
        tournamentId.toString(),
        selectedMatchForReferee.id.toString(),
        refereeId
      )
      if (res.success) {
        set({ showAssignReferee: false, selectedMatchForReferee: null })
        await loadSchedule()
        return { success: true }
      }
      return { success: false, error: res.error || "Failed to assign referee" }
    } catch (err) {
      console.error(err)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  unassignReferee: async (fixtureId) => {
    const { tournamentId, loadSchedule } = get()
    if (!tournamentId) return { success: false, error: "Missing tournament ID" }

    try {
      const res = await unassignRefereeFromMatchAction(
        tournamentId.toString(),
        fixtureId
      )
      if (res.success) {
        await loadSchedule()
        return { success: true }
      }
      return {
        success: false,
        error: res.error || "Failed to unassign referee",
      }
    } catch (err) {
      console.error(err)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  manualSchedule: async (courtId, timeSlot) => {
    const {
      tournamentId,
      selectedMatchForManual,
      selectedDate,
      selectedCenterId,
      bookings,
      loadSchedule,
    } = get()
    if (!tournamentId || !selectedMatchForManual) {
      return { success: false, error: "Missing required details" }
    }

    let foundBookingId: number | null = null
    let foundBookingItemId: string | null = null

    for (const booking of bookings) {
      if (booking.centerId !== selectedCenterId) continue
      if (!booking.date) continue

      const bDate = booking.date.split("T")[0]
      if (bDate !== selectedDate) continue

      if (
        booking.statusMirror.toUpperCase() === "CANCELLED" ||
        booking.statusMirror.toUpperCase() === "EXPIRED"
      ) {
        continue
      }

      if (booking.items) {
        const item = booking.items.find((it) => {
          if (it.courtId !== courtId) return false

          const itemTime = it.startTime.substring(0, 5)
          return itemTime === timeSlot
        })

        if (item) {
          foundBookingId = booking.id
          foundBookingItemId = item.id
          break
        }
      }
    }

    if (!foundBookingId || !foundBookingItemId) {
      return {
        success: false,
        error:
          "No matching active booking slot found for the selected court and time.",
      }
    }

    try {
      const res = await linkBookingItemToFixtureAction(
        tournamentId,
        selectedMatchForManual.id.toString(),
        {
          bookingId: foundBookingId,
          bookingItemId: foundBookingItemId,
          matchDurationMinutes: selectedMatchForManual.duration || 15,
        }
      )
      if (res.success) {
        set({ showManualSchedule: false, selectedMatchForManual: null })
        await loadSchedule()
        return { success: true }
      }
      return {
        success: false,
        error: res.error || "Failed to schedule match",
      }
    } catch (err) {
      console.error(err)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  reset: () =>
    set({
      tournamentId: null,
      fixtures: [],
      bookings: [],
      centers: [],
      availableCourts: [],
      isLoading: true,
      selectedDate: "",
      selectedEventId: "all",
      selectedCenterId: "",
      unscheduledMatches: [],
      scheduledMatches: [],
      courtsList: [],
      showAutoSchedule: false,
      showAssignReferee: false,
      selectedMatchForReferee: null,
      showManualSchedule: false,
      selectedMatchForManual: null,
      autoScheduleConfig: null,
      previewAssignments: [],
      previewEventId: null,
      isPreviewMode: false,
      viewMode: "normal",
    }),
}))

// State selector helpers that pull pre-computed arrays to guarantee absolute reference stability in React 19
export const useUnscheduledMatches = () =>
  useSchedulingStore((s) => s.unscheduledMatches)
export const useScheduledMatches = () =>
  useSchedulingStore((s) => s.scheduledMatches)
export const useCourtsList = () => useSchedulingStore((s) => s.courtsList)
export const useBookings = () => useSchedulingStore((s) => s.bookings)
export const useCenters = () => useSchedulingStore((s) => s.centers)
export const useSelectedCenterId = () =>
  useSchedulingStore((s) => s.selectedCenterId)
export const useAvailableCourts = () =>
  useSchedulingStore((s) => s.availableCourts)

export const useIsPreviewMode = () => useSchedulingStore((s) => s.isPreviewMode)
export const usePreviewAssignments = () =>
  useSchedulingStore((s) => s.previewAssignments)
export const useAutoScheduleConfig = () =>
  useSchedulingStore((s) => s.autoScheduleConfig)
export const usePreviewEventId = () =>
  useSchedulingStore((s) => s.previewEventId)

export const useUpdatePreviewAssignment = () =>
  useSchedulingStore((s) => s.updatePreviewAssignment)

export const useViewMode = () => useSchedulingStore((s) => s.viewMode)
export const useSetViewMode = () => useSchedulingStore((s) => s.setViewMode)
