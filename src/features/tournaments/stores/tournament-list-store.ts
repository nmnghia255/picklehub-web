"use client"

import { create } from "zustand"

import type { Tournament, TournamentStatus } from "../types/tournament"

export interface TournamentListFilters {
  role: string
  status: TournamentStatus | "all"
  search: string
}

export interface TournamentListState {
  tournaments: Tournament[]
  filters: TournamentListFilters
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  isLoading: boolean

  // Actions
  setSearch: (search: string) => void
  setRole: (role: string) => void
  setStatus: (status: TournamentStatus | "all") => void
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  resetFilters: () => void
  setTournaments: (tournaments: Tournament[]) => void
  setPagination: (totalItems: number, totalPages: number) => void
  setIsLoading: (isLoading: boolean) => void
}

export const useTournamentListStore = create<TournamentListState>((set) => ({
  tournaments: [],
  filters: {
    role: "all",
    status: "all",
    search: "",
  },
  currentPage: 1,
  pageSize: 9, // Default to 9 as requested
  totalItems: 0,
  totalPages: 1,
  isLoading: false,

  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search },
      currentPage: 1, // Reset pagination to page 1 when query changes
    })),

  setRole: (role) =>
    set((state) => ({
      filters: { ...state.filters, role },
      currentPage: 1, // Reset pagination to page 1 when filter changes
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
        role: "all",
        status: "all",
        search: "",
      },
      currentPage: 1,
    }),

  setTournaments: (tournaments) => set({ tournaments }),
  setPagination: (totalItems, totalPages) => set({ totalItems, totalPages }),
  setIsLoading: (isLoading) => set({ isLoading }),
}))

// Selector helpers for reactive derived state
export const selectFilteredTournaments = (state: TournamentListState) => {
  return state.tournaments
}

export const selectPaginatedTournaments = (state: TournamentListState) => {
  return state.tournaments
}

export const selectTotalPages = (state: TournamentListState) => {
  return state.totalPages
}
