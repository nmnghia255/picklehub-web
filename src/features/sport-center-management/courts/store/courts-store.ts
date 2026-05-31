"use client"

import { create } from "zustand"

import { listOwnerSportCentersAction } from "../../actions/sport-center-actions"
import type { Court } from "../../types/court"
import type { SportCenter } from "../../types/sport-center"
// import { listCenterCourts } from "@/features/sport-center-management/api/court-service"
// import type { SportCenter } from "@/features/sport-center-management/api/sport-center-service"
// import { listOwnerSportCenters } from "@/features/sport-center-management/api/sport-center-service"
// import type { Court } from "@/features/sport-center-management/types"
import type { CourtStatus, CourtType } from "../types"

export type CourtStatusFilter = CourtStatus | "all"
export type CourtTypeFilter = CourtType | "all"

// function isPermissionError(error: unknown) {
//   if (!error || typeof error !== "object") return false
//   const status = (error as { response?: { status?: number } }).response?.status
//   return status === 401 || status === 403
// }

export type CourtsState = {
  centers: SportCenter[]
  loadingCenters: boolean
  selectedCenterId: string | null
  courts: Court[]
  loadingCourts: boolean
  permissionDenied: boolean
  error: string | null
  search: string
  statusFilter: CourtStatusFilter
  typeFilter: CourtTypeFilter
  selectedCourtId: string | null
  detailOpen: boolean
  fetchCenters: () => Promise<void>
  fetchCourts: () => Promise<void>
  setSelectedCenter: (centerId: string) => void
  setSearch: (search: string) => void
  setStatusFilter: (status: CourtStatusFilter) => void
  setTypeFilter: (type: CourtTypeFilter) => void
  openCourt: (court: Court) => void
  setDetailOpen: (open: boolean) => void
  clearError: () => void
}

export const useCourtsStore = create<CourtsState>((set, get) => ({
  centers: [],
  loadingCenters: false,
  selectedCenterId: null,
  courts: [],
  loadingCourts: false,
  permissionDenied: false,
  error: null,
  search: "",
  statusFilter: "all",
  typeFilter: "all",
  selectedCourtId: null,
  detailOpen: false,

  fetchCenters: async () => {
    set({ loadingCenters: true })

    try {
      const centers = await listOwnerSportCentersAction()
      set({ centers })

      // Auto-select the first center when none is selected yet.
      const { selectedCenterId } = get()
      if (!selectedCenterId && centers.length > 0) {
        set({ selectedCenterId: centers[0].id })
      }
    } catch (error) {
      console.error("[Courts] fetchCenters error:", error)
      set({ centers: [] })
    } finally {
      set({ loadingCenters: false })
    }
  },

  fetchCourts: async () => {
    // const { selectedCenterId } = get()
    // if (!selectedCenterId) {
    //   set({ courts: [] })
    //   return
    // }
    // set({ loadingCourts: true })
    // try {
    //   // const { courts } = await listCenterCourts(selectedCenterId)
    //   set({ courts, permissionDenied: false })
    // } catch (error) {
    //   console.error("[Courts] fetchCourts error:", error)
    //   set({
    //     courts: [],
    //     permissionDenied: isPermissionError(error),
    //     error: "Không thể tải danh sách sân.",
    //   })
    // } finally {
    //   set({ loadingCourts: false })
    // }
  },

  setSelectedCenter: (centerId) =>
    set({ selectedCenterId: centerId, courts: [] }),

  setSearch: (search) => set({ search }),

  setStatusFilter: (statusFilter) => set({ statusFilter }),

  setTypeFilter: (typeFilter) => set({ typeFilter }),

  openCourt: (court) => set({ selectedCourtId: court.id, detailOpen: true }),

  setDetailOpen: (open) => set({ detailOpen: open }),

  clearError: () => set({ error: null }),
}))
