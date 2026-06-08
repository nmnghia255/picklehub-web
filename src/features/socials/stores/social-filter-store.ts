import { create } from "zustand"

import type {
  AgeGroup,
  GenderPolicy,
  SocialFormat,
  SocialStatus,
} from "../types/social"

export type Order = "asc" | "desc"

export type Filters = {
  order: Order | null
  page: number | null
  limit: number | null
  groupId: string | null
  status: SocialStatus | null
  search: string | null
  startFrom: string | null
  startTo: string | null
  upcoming: boolean | null
  hasAvailableSlots: boolean | null
  minimumLevel: number | null
  maximumLevel: number | null
  format: SocialFormat | null
  genderPolicy: GenderPolicy | null
  ageGroup: AgeGroup | null
  tab?: string | null
  role?: string | null
}

const defaultFilters: Filters = {
  order: null,
  page: 1,
  limit: 10,
  groupId: null,
  status: null,
  search: null,
  startFrom: null,
  startTo: null,
  upcoming: null,
  hasAvailableSlots: null,
  minimumLevel: null,
  maximumLevel: null,
  format: null,
  genderPolicy: null,
  ageGroup: null,
  tab: null,
  role: null,
}

export interface SocialFiltersState {
  filterDrawerOpen: boolean
  setFilterDrawerOpen: (open: boolean) => void
  filters: Filters

  setFilters: (
    update: Partial<Filters> | ((prevFilters: Filters) => Partial<Filters>)
  ) => void

  updateSingleFilter: <K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ) => void
  resetFilters: () => void
}

const createSocialFiltersStore = () =>
  create<SocialFiltersState>((set) => ({
    filterDrawerOpen: false,
    setFilterDrawerOpen: (open: boolean) => set({ filterDrawerOpen: open }),

    filters: defaultFilters,

    setFilters: (update) =>
      set((state) => {
        const generatedUpdate =
          typeof update === "function" ? update(state.filters) : update
        return {
          filters: {
            ...state.filters,
            ...generatedUpdate,
          },
        }
      }),

    updateSingleFilter: (key, value) =>
      set((state) => ({
        filters: {
          ...state.filters,
          [key]: value,
        },
      })),

    resetFilters: () => set({ filters: defaultFilters }),
  }))

export const useDiscoverFiltersStore = createSocialFiltersStore()
export const useMySocialsFiltersStore = createSocialFiltersStore()
