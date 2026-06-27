"use client"

import { toast } from "sonner"
import { create } from "zustand"

import {
  deleteEventBracketsAction,
  generateEventBracketsAction,
  getEventBracketsAction,
} from "../actions/bracket-actions"
import type { Bracket } from "../types/bracket"

export interface BracketState {
  selectedEventId: number | null
  selectedFormat: string
  viewMode: string
  selectedMatch: Bracket | null
  zoom: number
  resetViewTrigger: number
  brackets: Bracket[]
  isLoading: boolean
  isPending: boolean
  searchQuery: string

  setSelectedEventId: (eventId: number | null) => void
  setSelectedFormat: (format: string) => void
  setViewMode: (viewMode: string) => void
  setSelectedMatch: (match: Bracket | null) => void
  setZoom: (zoom: number) => void
  resetView: () => void
  setBrackets: (brackets: Bracket[]) => void
  setIsLoading: (isLoading: boolean) => void
  setSearchQuery: (query: string) => void

  // Async Actions
  loadBrackets: (tournamentId: number, eventId: number) => Promise<void>
  generateBracket: (
    tournamentId: number,
    eventId: number,
    successMessage: string,
    errorMessage: string
  ) => Promise<void>
  deleteBracket: (
    tournamentId: number,
    eventId: number,
    successMessage: string,
    errorMessage: string
  ) => Promise<void>
}

function extractBrackets(data: unknown): Bracket[] | null {
  if (Array.isArray(data)) {
    return data as Bracket[]
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>
    if ("brackets" in obj && Array.isArray(obj.brackets)) {
      return obj.brackets as Bracket[]
    }
    if ("bracket" in obj && Array.isArray(obj.bracket)) {
      return obj.bracket as Bracket[]
    }
    if ("data" in obj && Array.isArray(obj.data)) {
      return obj.data as Bracket[]
    }
    // Fallback: find first array property
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) {
        return obj[key] as Bracket[]
      }
    }
  }
  return null
}

export const useBracketStore = create<BracketState>((set) => ({
  selectedEventId: null,
  selectedFormat: "single-elimination",
  viewMode: "standard",
  selectedMatch: null,
  zoom: 100,
  resetViewTrigger: 0,
  brackets: [],
  isLoading: false,
  isPending: false,
  searchQuery: "",

  setSelectedEventId: (eventId) => set({ selectedEventId: eventId }),
  setSelectedFormat: (format) => set({ selectedFormat: format }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedMatch: (match) => set({ selectedMatch: match }),
  setZoom: (zoom) => set({ zoom }),
  resetView: () =>
    set((state) => ({
      zoom: 100,
      resetViewTrigger: state.resetViewTrigger + 1,
    })),
  setBrackets: (brackets) => set({ brackets }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  loadBrackets: async (tournamentId, eventId) => {
    set({ isLoading: true })
    try {
      const res = await getEventBracketsAction(tournamentId, eventId)
      const extracted = extractBrackets(res.data)
      if (res.success && extracted !== null) {
        set({ brackets: extracted })
      } else {
        set({ brackets: [] })
      }
    } catch (error) {
      console.error("Failed to load brackets:", error)
      set({ brackets: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  generateBracket: async (
    tournamentId,
    eventId,
    successMessage,
    errorMessage
  ) => {
    set({ isPending: true })
    try {
      const res = await generateEventBracketsAction(tournamentId, eventId)
      const extracted = extractBrackets(res.data)
      if (res.success && extracted !== null) {
        set({ brackets: extracted })
        toast.success(successMessage)
      } else {
        set({ brackets: [] })
        toast.error(res.error || errorMessage)
      }
    } catch (error) {
      console.error("Failed to generate bracket:", error)
      toast.error(errorMessage)
    } finally {
      set({ isPending: false })
    }
  },

  deleteBracket: async (
    tournamentId,
    eventId,
    successMessage,
    errorMessage
  ) => {
    set({ isPending: true })
    try {
      const res = await deleteEventBracketsAction(tournamentId, eventId)
      if (res.success) {
        set({ brackets: [] })
        toast.success(successMessage)
      } else {
        toast.error(res.error || errorMessage)
      }
    } catch (error) {
      console.error("Failed to delete bracket:", error)
      toast.error(errorMessage)
    } finally {
      set({ isPending: false })
    }
  },
}))
