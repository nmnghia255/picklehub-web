import { create } from "zustand"

import {
  assignRefereeToMatchAction,
  unassignRefereeFromMatchAction,
} from "../actions/referee-actions"
import {
  getTournamentFixturesWithScheduleAction,
  linkBookingItemToFixtureAction,
  unlinkBookingItemFromFixtureAction,
} from "../actions/schedule-actions"
import type { Match, MatchWarning } from "../types/match"

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

const defaultCourts = ["Court 1", "Court 2", "Court 3", "Court 4"]

// Helper function to compute stable arrays from state
const computeDerivations = (fixtures: Match[], selectedEventId: string) => {
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

  const uniqueCourts = Array.from(
    new Set(fixtures.map((f) => f.court).filter(Boolean))
  ) as string[]
  const courtsList = uniqueCourts.length > 0 ? uniqueCourts : defaultCourts

  return { unscheduledMatches, scheduledMatches, courtsList }
}

interface SchedulingState {
  tournamentId: number | null
  fixtures: Match[]
  isLoading: boolean
  selectedDate: string
  selectedEventId: string

  // Cached derivations
  unscheduledMatches: Match[]
  scheduledMatches: Match[]
  courtsList: string[]

  // Modals state
  showAutoSchedule: boolean
  showAssignReferee: boolean
  selectedMatchForReferee: Match | null
  showManualSchedule: boolean
  selectedMatchForManual: Match | null

  // Setters
  setTournamentId: (id: number | null) => void
  setSelectedDate: (date: string) => void
  setSelectedEventId: (eventId: string) => void
  setShowAutoSchedule: (show: boolean) => void
  setShowAssignReferee: (show: boolean) => void
  setSelectedMatchForReferee: (match: Match | null) => void
  setShowManualSchedule: (show: boolean) => void
  setSelectedMatchForManual: (match: Match | null) => void

  // Actions
  loadSchedule: () => Promise<void>
  unscheduleMatch: (
    fixtureId: string
  ) => Promise<{ success: boolean; error?: string }>
  assignReferee: (
    refereeId: string,
    refereeName: string
  ) => Promise<{ success: boolean; error?: string }>
  unassignReferee: (
    fixtureId: string
  ) => Promise<{ success: boolean; error?: string }>
  manualSchedule: (
    courtName: string,
    timeSlot: string
  ) => Promise<{ success: boolean; error?: string }>
  reset: () => void
}

export const useSchedulingStore = create<SchedulingState>((set, get) => ({
  tournamentId: null,
  fixtures: [],
  isLoading: true,
  selectedDate: "",
  selectedEventId: "all",

  unscheduledMatches: [],
  scheduledMatches: [],
  courtsList: defaultCourts,

  showAutoSchedule: false,
  showAssignReferee: false,
  selectedMatchForReferee: null,
  showManualSchedule: false,
  selectedMatchForManual: null,

  setTournamentId: (tournamentId) => set({ tournamentId }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedEventId: (selectedEventId) => {
    const { fixtures } = get()
    const derivations = computeDerivations(fixtures, selectedEventId)
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
    const { tournamentId, selectedEventId } = get()
    if (!tournamentId) return

    set({ isLoading: true })
    try {
      const res = await getTournamentFixturesWithScheduleAction(tournamentId)
      if (res.success && res.data) {
        let rawFixtures: FixtureRawData[] = []
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

        const mappedMatches: Match[] = rawFixtures.map((f) => ({
          id: f.id,
          tournamentId: tournamentId,
          eventId: f.eventId || 0,
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
          court: f.court,
          courtId: f.courtId,
          courtStatus: f.courtStatus,
          time: f.time,
          startTime: f.startTime,
          duration: f.duration || 45,
          priority: f.priority || "medium",
          refereeId: f.refereeId,
          refereeName: f.refereeName,
          bookingId: f.bookingId ? Number(f.bookingId) : null,
          bookingItemId: f.bookingItemId,
          warnings: f.warnings || [],
        }))
        const derivations = computeDerivations(mappedMatches, selectedEventId)
        set({ fixtures: mappedMatches, ...derivations })
      }
    } catch (err) {
      console.error(err)
    } finally {
      set({ isLoading: false })
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

  assignReferee: async (refereeId, refereeName) => {
    const { tournamentId, selectedMatchForReferee, loadSchedule } = get()
    if (!tournamentId || !selectedMatchForReferee) {
      return { success: false, error: "Missing required details" }
    }

    try {
      const res = await assignRefereeToMatchAction(
        tournamentId.toString(),
        selectedMatchForReferee.id.toString(),
        refereeId,
        refereeName
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

  manualSchedule: async (courtName, timeSlot) => {
    const { tournamentId, selectedMatchForManual, loadSchedule } = get()
    if (!tournamentId || !selectedMatchForManual) {
      return { success: false, error: "Missing required details" }
    }

    try {
      const res = await linkBookingItemToFixtureAction(
        tournamentId,
        selectedMatchForManual.id.toString(),
        {
          bookingId: 1, // Mock Booking ID
          bookingItemId: `${courtName}_${timeSlot}`,
        }
      )
      if (res.success) {
        set({ showManualSchedule: false, selectedMatchForManual: null })
        await loadSchedule()
        return { success: true }
      }
      return { success: false, error: res.error || "Failed to schedule match" }
    } catch (err) {
      console.error(err)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  reset: () =>
    set({
      tournamentId: null,
      fixtures: [],
      isLoading: true,
      selectedDate: "",
      selectedEventId: "all",
      unscheduledMatches: [],
      scheduledMatches: [],
      courtsList: defaultCourts,
      showAutoSchedule: false,
      showAssignReferee: false,
      selectedMatchForReferee: null,
      showManualSchedule: false,
      selectedMatchForManual: null,
    }),
}))

// State selector helpers that pull pre-computed arrays to guarantee absolute reference stability in React 19
export const useUnscheduledMatches = () =>
  useSchedulingStore((s) => s.unscheduledMatches)
export const useScheduledMatches = () =>
  useSchedulingStore((s) => s.scheduledMatches)
export const useCourtsList = () => useSchedulingStore((s) => s.courtsList)
