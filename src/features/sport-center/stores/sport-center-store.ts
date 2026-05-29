import { create } from "zustand"

import type { SportCenter } from "@/features/sport-center/types/sport-center"

export type SportCenterTab = "sport-center" | "booking"

export interface SportCenterPaginationState {
  currentPage: number
  pageSize: number
  total: number
  offset: number
  hasNextPage: boolean
}

interface SportCenterStore {
  // State
  sportCenter: SportCenter
  activeTab: SportCenterTab
  searchQuery: string
  favoriteFilter: string
  sportCenters: SportCenter[]
  pagination: SportCenterPaginationState | null
  loading: boolean

  // Actions
  setSportCenter: (center: SportCenter) => void
  setActiveTab: (tab: SportCenterTab) => void
  setSearchQuery: (query: string) => void
  setFavoriteFilter: (filter: string) => void
  setSportCenters: (centers: SportCenter[]) => void
  setPagination: (pagination: SportCenterPaginationState | null) => void
  setLoading: (loading: boolean) => void

  // Computed
  getFilteredSportCenters: () => SportCenter[]
  getBookedSportCenters: () => SportCenter[]
}

export const useSportCenterStore = create<SportCenterStore>((set, get) => ({
  // Initial state
  sportCenter: {} as SportCenter,
  activeTab: "sport-center",
  searchQuery: "",
  favoriteFilter: "all",
  sportCenters: [],
  pagination: null,
  loading: false,

  // Actions
  setSportCenter: (center) => set({ sportCenter: center }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFavoriteFilter: (filter) => set({ favoriteFilter: filter }),
  setSportCenters: (centers) => set({ sportCenters: centers }),
  setPagination: (pagination) => set({ pagination }),
  setLoading: (loading) => set({ loading }),

  // Computed selectors
  getFilteredSportCenters: () => {
    const state = get()
    return state.sportCenters.filter((sportCenter) => {
      const text = `${sportCenter.name} ${sportCenter.address}`.toLowerCase()
      const matchesSearch = text.includes(
        state.searchQuery.trim().toLowerCase()
      )
      const matchesFavorite =
        state.favoriteFilter === "all" ||
        (state.favoriteFilter === "favorite" && sportCenter.isFavourite)

      return matchesSearch && matchesFavorite
    })
  },

  getBookedSportCenters: () => {
    const state = get()
    return state.sportCenters.filter((center) => center.isFavourite).slice(0, 2)
  },
}))
