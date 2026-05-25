import { create } from "zustand"

import type { SportCenter } from "@/features/sport-center/types/sport-center"

export type SportCenterTab = "sport-center" | "booking"

interface SportCenterStore {
  // State
  activeTab: SportCenterTab
  searchQuery: string
  favoriteFilter: string
  sportCenters: SportCenter[]
  loading: boolean

  // Actions
  setActiveTab: (tab: SportCenterTab) => void
  setSearchQuery: (query: string) => void
  setFavoriteFilter: (filter: string) => void
  setSportCenters: (centers: SportCenter[]) => void
  setLoading: (loading: boolean) => void

  // Computed
  getFilteredSportCenters: () => SportCenter[]
  getBookedSportCenters: () => SportCenter[]
}

export const useSportCenterStore = create<SportCenterStore>((set, get) => ({
  // Initial state
  activeTab: "sport-center",
  searchQuery: "",
  favoriteFilter: "all",
  sportCenters: [],
  loading: false,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFavoriteFilter: (filter) => set({ favoriteFilter: filter }),
  setSportCenters: (centers) => set({ sportCenters: centers }),
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
    return state.sportCenters.filter((center) => center.isFavorite).slice(0, 2)
  },
}))
