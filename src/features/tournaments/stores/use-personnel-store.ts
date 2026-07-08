import { create } from "zustand"

import {
  assignRefereeToMatchAction,
  bulkAssignRefereeAction,
  enrollRefereeAction,
  inviteRefereeAction,
  listInvitationsAction,
  listMatchesWithRefereesAction,
  listRefereesAction,
  listUnassignedMatchesAction,
  revokeInvitationAction,
  unassignRefereeFromMatchAction,
  unenrollRefereeAction,
} from "../actions/referee-actions"
import type {
  AssignedReferee,
  Referee,
  RefereeInvitationItemDto,
  RefereeRequest,
} from "../types/referee"

interface PersonnelState {
  tournamentId: string | null
  referees: Referee[]
  matches: AssignedReferee[]
  invitations: RefereeInvitationItemDto[]
  isLoadingReferees: boolean
  isLoadingMatches: boolean
  isLoadingInvitations: boolean
  activeSubTab: "roster" | "assignments" | "invitations"
  refereeSearch: string
  matchSearch: string
  selectedEventId: string
  showUnassignedOnly: boolean

  // Setters
  setTournamentId: (tournamentId: string | null) => void
  setActiveSubTab: (
    activeSubTab: "roster" | "assignments" | "invitations"
  ) => void
  setRefereeSearch: (refereeSearch: string) => void
  setMatchSearch: (matchSearch: string) => void
  setSelectedEventId: (selectedEventId: string) => void
  setShowUnassignedOnly: (showUnassignedOnly: boolean) => void

  // Async Actions
  fetchRoster: () => Promise<void>
  fetchMatches: () => Promise<void>
  fetchInvitations: () => Promise<void>
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
  bulkAssignReferee: (
    matchIds: string[],
    refereeId: string
  ) => Promise<{ success: boolean; error?: string }>
  unassignReferee: (
    matchId: string
  ) => Promise<{ success: boolean; error?: string }>
  inviteReferee: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>
  revokeInvitation: (
    invitationId: number
  ) => Promise<{ success: boolean; error?: string }>
  reset: () => void
}

export const usePersonnelStore = create<PersonnelState>((set, get) => ({
  tournamentId: null,
  referees: [],
  matches: [],
  invitations: [],
  isLoadingReferees: false,
  isLoadingMatches: false,
  isLoadingInvitations: false,
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

  fetchInvitations: async () => {
    const { tournamentId } = get()
    if (!tournamentId) return

    set({ isLoadingInvitations: true })
    try {
      const res = await listInvitationsAction(tournamentId)
      if (res.success && res.data) {
        set({ invitations: res.data })
      } else {
        console.error(res.error || "Failed to load invitations")
      }
    } catch (err) {
      console.error(err)
    } finally {
      set({ isLoadingInvitations: false })
    }
  },

  enrollReferee: async (request) => {
    const { tournamentId, fetchRoster } = get()
    if (!tournamentId) return { success: false, error: "Missing tournament ID" }

    try {
      const res = await enrollRefereeAction(tournamentId, request)
      if (res.success) {
        await fetchRoster()
        return { success: true }
      }
      return { success: false, error: res.error || "Failed to enroll referee" }
    } catch (err) {
      console.error(err)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  unenrollReferee: async (refereeId) => {
    const { tournamentId, fetchRoster } = get()
    if (!tournamentId) return { success: false, error: "Missing tournament ID" }

    try {
      const res = await unenrollRefereeAction(tournamentId, refereeId)
      if (res.success) {
        await fetchRoster()
        return { success: true }
      }
      return {
        success: false,
        error: res.error || "Failed to unenroll referee",
      }
    } catch (err) {
      console.error(err)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  assignReferee: async (matchId, refereeId) => {
    const { tournamentId, fetchMatches, fetchRoster } = get()
    if (!tournamentId) return { success: false, error: "Missing tournament ID" }

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
      return { success: false, error: res.error || "Failed to assign referee" }
    } catch (err) {
      console.error(err)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  bulkAssignReferee: async (matchIds, refereeId) => {
    const { tournamentId, fetchMatches, fetchRoster } = get()
    if (!tournamentId) return { success: false, error: "Missing tournament ID" }

    try {
      const res = await bulkAssignRefereeAction(
        tournamentId,
        matchIds,
        refereeId
      )
      if (res.success) {
        await fetchMatches()
        await fetchRoster() // Refresh workloads
        return { success: true }
      }
      return {
        success: false,
        error: res.error || "Failed to bulk assign referee",
      }
    } catch (err) {
      console.error(err)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  unassignReferee: async (matchId) => {
    const { tournamentId, fetchMatches, fetchRoster } = get()
    if (!tournamentId) return { success: false, error: "Missing tournament ID" }

    try {
      const res = await unassignRefereeFromMatchAction(tournamentId, matchId)
      if (res.success) {
        await fetchMatches()
        await fetchRoster() // Refresh workloads
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

  inviteReferee: async (email) => {
    const { tournamentId, fetchInvitations } = get()
    if (!tournamentId) return { success: false, error: "Missing tournament ID" }

    try {
      const res = await inviteRefereeAction(tournamentId, { email })
      if (res.success) {
        await fetchInvitations()
        return { success: true }
      }
      return { success: false, error: res.error || "Failed to send invitation" }
    } catch (err) {
      console.error(err)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  revokeInvitation: async (invitationId) => {
    const { tournamentId, fetchInvitations } = get()
    if (!tournamentId) return { success: false, error: "Missing tournament ID" }

    try {
      const res = await revokeInvitationAction(tournamentId, invitationId)
      if (res.success) {
        await fetchInvitations()
        return { success: true }
      }
      return {
        success: false,
        error: res.error || "Failed to revoke invitation",
      }
    } catch (err) {
      console.error(err)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  reset: () =>
    set({
      tournamentId: null,
      referees: [],
      matches: [],
      invitations: [],
      isLoadingReferees: false,
      isLoadingMatches: false,
      isLoadingInvitations: false,
      activeSubTab: "roster",
      refereeSearch: "",
      matchSearch: "",
      selectedEventId: "all",
      showUnassignedOnly: false,
    }),
}))
