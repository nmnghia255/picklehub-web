import { create } from "zustand"

import {
  assignRefereeToMatchAction,
  enrollRefereeAction,
  listMatchesWithRefereesAction,
  listRefereesAction,
  listUnassignedMatchesAction,
  unassignRefereeFromMatchAction,
  unenrollRefereeAction,
} from "../actions/referee-actions"
import type { AssignedReferee, Referee, RefereeRequest } from "../types/referee"

interface PersonnelState {
  tournamentId: string | null
  referees: Referee[]
  matches: AssignedReferee[]
  isLoadingReferees: boolean
  isLoadingMatches: boolean
  activeSubTab: "roster" | "assignments"
  refereeSearch: string
  matchSearch: string
  selectedEventId: string
  showUnassignedOnly: boolean

  // Setters
  setTournamentId: (tournamentId: string | null) => void
  setActiveSubTab: (activeSubTab: "roster" | "assignments") => void
  setRefereeSearch: (refereeSearch: string) => void
  setMatchSearch: (matchSearch: string) => void
  setSelectedEventId: (selectedEventId: string) => void
  setShowUnassignedOnly: (showUnassignedOnly: boolean) => void

  // Async Actions
  fetchRoster: () => Promise<void>
  fetchMatches: () => Promise<void>
  enrollReferee: (
    request: RefereeRequest
  ) => Promise<{ success: boolean; error?: string }>
  unenrollReferee: (
    refereeId: string
  ) => Promise<{ success: boolean; error?: string }>
  assignReferee: (
    matchId: string,
    refereeId: string,
    refereeName: string
  ) => Promise<{ success: boolean; error?: string }>
  unassignReferee: (
    matchId: string
  ) => Promise<{ success: boolean; error?: string }>
  reset: () => void
}

export const usePersonnelStore = create<PersonnelState>((set, get) => ({
  tournamentId: null,
  referees: [],
  matches: [],
  isLoadingReferees: false,
  isLoadingMatches: false,
  activeSubTab: "roster",
  refereeSearch: "",
  matchSearch: "",
  selectedEventId: "all",
  showUnassignedOnly: false,

  setTournamentId: (tournamentId) => set({ tournamentId }),
  setActiveSubTab: (activeSubTab) => set({ activeSubTab }),
  setRefereeSearch: (refereeSearch) => set({ refereeSearch }),
  setMatchSearch: (matchSearch) => set({ matchSearch }),
  setSelectedEventId: (selectedEventId) => set({ selectedEventId }),
  setShowUnassignedOnly: (showUnassignedOnly) => set({ showUnassignedOnly }),

  fetchRoster: async () => {
    const { tournamentId } = get()
    if (!tournamentId) return

    set({ isLoadingReferees: true })
    try {
      const res = await listRefereesAction(tournamentId)
      if (res.success && res.data) {
        set({ referees: res.data })
      } else {
        console.error(res.error || "Failed to load referees roster")
      }
    } catch (err) {
      console.error(err)
    } finally {
      set({ isLoadingReferees: false })
    }
  },

  fetchMatches: async () => {
    const { tournamentId, selectedEventId, showUnassignedOnly } = get()
    if (!tournamentId) return

    set({ isLoadingMatches: true })
    try {
      const eventFilter =
        selectedEventId === "all" ? undefined : selectedEventId
      let res
      if (showUnassignedOnly) {
        res = await listUnassignedMatchesAction(tournamentId, eventFilter)
      } else {
        res = await listMatchesWithRefereesAction(tournamentId, eventFilter)
      }

      if (res.success && res.data) {
        set({ matches: res.data })
      } else {
        console.error(res.error || "Failed to load match assignments")
      }
    } catch (err) {
      console.error(err)
    } finally {
      set({ isLoadingMatches: false })
    }
  },

  enrollReferee: async (request) => {
    const { tournamentId, fetchRoster } = get()
    if (!tournamentId) return { success: false, error: "" }

    try {
      const res = await enrollRefereeAction(tournamentId, request)
      if (res.success) {
        await fetchRoster()
        return { success: true }
      }
      return { success: false, error: res.error || "" }
    } catch (err) {
      console.error(err)
      return { success: false, error: "" }
    }
  },

  unenrollReferee: async (refereeId) => {
    const { tournamentId, fetchRoster } = get()
    if (!tournamentId) return { success: false, error: "" }

    try {
      const res = await unenrollRefereeAction(tournamentId, refereeId)
      if (res.success) {
        await fetchRoster()
        return { success: true }
      }
      return {
        success: false,
        error: res.error || "",
      }
    } catch (err) {
      console.error(err)
      return { success: false, error: "" }
    }
  },

  assignReferee: async (matchId, refereeId, refereeName) => {
    const { tournamentId, fetchMatches, fetchRoster } = get()
    if (!tournamentId) return { success: false, error: "" }

    try {
      const res = await assignRefereeToMatchAction(
        tournamentId,
        matchId,
        refereeId
      )
      if (res.success) {
        await fetchMatches()
        await fetchRoster() // Refresh workloads
        return { success: true }
      }
      return { success: false, error: res.error || "" }
    } catch (err) {
      console.error(err)
      return { success: false, error: "" }
    }
  },

  unassignReferee: async (matchId) => {
    const { tournamentId, fetchMatches, fetchRoster } = get()
    if (!tournamentId) return { success: false, error: "" }

    try {
      const res = await unassignRefereeFromMatchAction(tournamentId, matchId)
      if (res.success) {
        await fetchMatches()
        await fetchRoster() // Refresh workloads
        return { success: true }
      }
      return {
        success: false,
        error: res.error || "",
      }
    } catch (err) {
      console.error(err)
      return { success: false, error: "" }
    }
  },

  reset: () =>
    set({
      tournamentId: null,
      referees: [],
      matches: [],
      isLoadingReferees: false,
      isLoadingMatches: false,
      activeSubTab: "roster",
      refereeSearch: "",
      matchSearch: "",
      selectedEventId: "all",
      showUnassignedOnly: false,
    }),
}))
