"use client"

import { create } from "zustand"

import type { Tournament, TournamentStatus } from "../types/tournament"

export interface TournamentListFilters {
  status: TournamentStatus | "all"
  search: string
}

export interface TournamentListState {
  tournaments: Tournament[]
  filters: TournamentListFilters
  currentPage: number
  pageSize: number

  // Actions
  setSearch: (search: string) => void
  setStatus: (status: TournamentStatus | "all") => void
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  resetFilters: () => void
  setTournaments: (tournaments: Tournament[]) => void
}

export const useTournamentListStore = create<TournamentListState>((set) => ({
  tournaments: [],
  filters: {
    status: "all",
    search: "",
  },
  currentPage: 1,
  pageSize: 9, // Default to 9 as requested

  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search },
      currentPage: 1, // Reset pagination to page 1 when query changes
    })),

  setStatus: (status) =>
    set((state) => ({
      filters: { ...state.filters, status },
      currentPage: 1, // Reset pagination to page 1 when filter changes
    })),

  setCurrentPage: (currentPage) => set({ currentPage }),

  setPageSize: (pageSize) => set({ pageSize, currentPage: 1 }),

  resetFilters: () =>
    set({
      filters: {
        status: "all",
        search: "",
      },
      currentPage: 1,
    }),

  setTournaments: (tournaments) => set({ tournaments }),
}))

// Selector helpers for reactive derived state
export const selectFilteredTournaments = (state: TournamentListState) => {
  const { tournaments, filters } = state
  const { status, search } = filters

  return tournaments.filter((tournament) => {
    const matchesStatus = status === "all" || tournament.status === status
    const matchesSearch =
      tournament.name.toLowerCase().includes(search.toLowerCase()) ||
      tournament.venue.toLowerCase().includes(search.toLowerCase())

    return matchesStatus && matchesSearch
  })
}

export const selectPaginatedTournaments = (state: TournamentListState) => {
  const filtered = selectFilteredTournaments(state)
  const startIndex = (state.currentPage - 1) * state.pageSize
  return filtered.slice(startIndex, startIndex + state.pageSize)
}

export const selectTotalPages = (state: TournamentListState) => {
  const filtered = selectFilteredTournaments(state)
  return Math.ceil(filtered.length / state.pageSize)
}
