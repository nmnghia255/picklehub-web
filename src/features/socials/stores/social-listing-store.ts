import { create } from "zustand"

type Filters = {
  status: string
  genderPolicy: string
  ageGroup: string
  format: string
  availableSlots: boolean
}

interface SocialsState {
  searchQuery: string
  setSearchQuery: (q: string) => void
  filterDrawerOpen: boolean
  setFilterDrawerOpen: (open: boolean) => void
  filters: Filters
  setFilters: (f: Filters | ((prev: Filters) => Filters)) => void
  resetFilters: () => void
}

const defaultFilters: Filters = {
  status: "ALL",
  genderPolicy: "ALL",
  ageGroup: "ALL",
  format: "ALL",
  availableSlots: false,
}

export const useSocialsStore = create<SocialsState>((set) => ({
  searchQuery: "",
  setSearchQuery: (q: string) => set({ searchQuery: q }),
  filterDrawerOpen: false,
  setFilterDrawerOpen: (open: boolean) => set({ filterDrawerOpen: open }),
  filters: defaultFilters,
  setFilters: (update) =>
    set((state) => ({
      filters: typeof update === "function" ? update(state.filters) : update,
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}))

export default useSocialsStore
