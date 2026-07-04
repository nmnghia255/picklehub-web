"use client"

import { create } from "zustand"

import { getEventStandingsAction } from "../actions/tournament-event-actions"
import { registerTournamentEventAction } from "../actions/tournament-registration-actions"
import type {
  RegistrationRequest,
  RegistrationResponse,
} from "../types/registration"
import type { TournamentEventStanding } from "../types/tournament-event"

export interface EventDetailState {
  // Standing tab states
  standing: TournamentEventStanding | null
  isLoadingStanding: boolean
  standingError: string | null

  // Registration states
  isRegistering: boolean
  isRegisterConfirmOpen: boolean
  isPaymentProofOpen: boolean
  activeStage: "group" | "knockout"

  // Actions
  setActiveStage: (stage: "group" | "knockout") => void
  setRegistering: (val: boolean) => void
  setRegisterConfirmOpen: (val: boolean) => void
  setPaymentProofOpen: (val: boolean) => void

  fetchStandings: (tournamentId: string, eventId: string) => Promise<void>
  registerForEvent: (
    tournamentId: string,
    eventId: string,
    payload: RegistrationRequest
  ) => Promise<{
    success: boolean
    data?: RegistrationResponse
    error?: string
  }>
}

export const useEventStore = create<EventDetailState>((set) => ({
  // Default states
  standing: null,
  isLoadingStanding: false,
  standingError: null,
  isRegistering: false,
  isRegisterConfirmOpen: false,
  isPaymentProofOpen: false,
  activeStage: "group",

  setActiveStage: (activeStage) => set({ activeStage }),
  setRegistering: (isRegistering) => set({ isRegistering }),
  setRegisterConfirmOpen: (isRegisterConfirmOpen) =>
    set({ isRegisterConfirmOpen }),
  setPaymentProofOpen: (isPaymentProofOpen) => set({ isPaymentProofOpen }),

  fetchStandings: async (tournamentId: string, eventId: string) => {
    set({ isLoadingStanding: true, standingError: null })
    try {
      const res = await getEventStandingsAction(tournamentId, eventId)
      if (res.success && res.data) {
        set({ standing: res.data, isLoadingStanding: false })
      } else {
        set({
          standing: null,
          isLoadingStanding: false,
          standingError: res.error || "Failed to fetch standings",
        })
      }
    } catch (err) {
      console.error("Error loading standings:", err)
      set({
        standing: null,
        isLoadingStanding: false,
        standingError: "An unexpected error occurred",
      })
    }
  },

  registerForEvent: async (tournamentId, eventId, payload) => {
    set({ isRegistering: true })
    try {
      const res = await registerTournamentEventAction(
        tournamentId,
        eventId,
        payload
      )
      return res
    } catch (err) {
      console.error("Failed to register:", err)
      return {
        success: false,
        error: "An unexpected error occurred during registration",
      }
    } finally {
      set({ isRegistering: false })
    }
  },
}))
