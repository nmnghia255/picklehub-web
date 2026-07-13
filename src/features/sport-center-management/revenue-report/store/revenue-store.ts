"use client"

import { create } from "zustand"

import enManagement from "@/i18n/locales/en/sport-center-management.json"
import viManagement from "@/i18n/locales/vi/sport-center-management.json"

import { listOwnerSportCentersAction } from "../../actions/sport-center-actions"
import type { SportCenter } from "../../types/sport-center"
// import type { SportCenter } from "@/features/sport-center-management/api/sport-center-service"
// import { listOwnerSportCenters } from "@/features/sport-center-management/api/sport-center-service"
import {
  exportRevenueCsv,
  getRevenueCancellations,
  getRevenueDailyStatistics,
  getRevenueStatistics,
  getRevenueSummary,
  getRevenueTransactions,
} from "../api/revenue-service"
import type {
  RevenueCancellationAnalysis,
  RevenueDailyStatistics,
  RevenueMethod,
  RevenueStatistics,
  RevenueStatus,
  RevenueSummary,
  RevenueTransaction,
  RevenueTransactionsPagination,
} from "../types"
import { getDefaultDateRange } from "../utils/format"

export type RevenueStatusFilter = RevenueStatus | "all"
export type RevenueMethodFilter = RevenueMethod | "all"

export type RevenueFilters = {
  from: string
  to: string
  status: RevenueStatusFilter
  method: RevenueMethodFilter
  centerIds: string[]
  limit: number
  offset: number
}

const DEFAULT_RANGE = getDefaultDateRange()

function getManagementLocale() {
  const language =
    typeof navigator !== "undefined" ? (navigator.language ?? "") : ""
  return language.toLowerCase().startsWith("vi") ? viManagement : enManagement
}

function resolveCenterId(centerIds: string[]) {
  return centerIds.length === 1 ? centerIds[0] : undefined
}

function isPermissionError(error: unknown) {
  if (!error || typeof error !== "object") return false

  const status = (error as { response?: { status?: number } }).response?.status
  return status === 401 || status === 403
}

export type RevenueReportState = {
  centers: SportCenter[]
  loadingCenters: boolean
  filters: RevenueFilters
  summary: RevenueSummary | null
  statistics: RevenueStatistics | null
  daily: RevenueDailyStatistics | null
  cancellations: RevenueCancellationAnalysis | null
  transactions: RevenueTransaction[]
  pagination: RevenueTransactionsPagination | null
  loadingOverview: boolean
  loadingTransactions: boolean
  exporting: boolean
  permissionDenied: boolean
  error: string | null
  detailOpen: boolean
  selectedTransactionId: string | null
  fetchCenters: () => Promise<void>
  fetchOverview: () => Promise<void>
  fetchTransactions: () => Promise<void>
  refreshAll: () => Promise<void>
  exportCsv: () => Promise<string | null>
  setDateRange: (from: string, to: string) => void
  setStatus: (status: RevenueStatusFilter) => void
  setMethod: (method: RevenueMethodFilter) => void
  toggleCenter: (centerId: string) => void
  clearCenters: () => void
  setLimit: (limit: number) => void
  setOffset: (offset: number) => void
  resetFilters: () => void
  openTransaction: (transaction: RevenueTransaction) => void
  setDetailOpen: (open: boolean) => void
  clearError: () => void
}

export const useRevenueReportStore = create<RevenueReportState>((set, get) => ({
  centers: [],
  loadingCenters: false,
  filters: {
    from: DEFAULT_RANGE.from,
    to: DEFAULT_RANGE.to,
    status: "all",
    method: "all",
    centerIds: [],
    limit: 20,
    offset: 0,
  },
  summary: null,
  statistics: null,
  daily: null,
  cancellations: null,
  transactions: [],
  pagination: null,
  loadingOverview: false,
  loadingTransactions: false,
  exporting: false,
  permissionDenied: false,
  error: null,
  detailOpen: false,
  selectedTransactionId: null,

  fetchCenters: async () => {
    set({ loadingCenters: true })

    try {
      const centers = await listOwnerSportCentersAction()
      set({ centers })
    } catch (error) {
      console.error("[RevenueReport] fetchCenters error:", error)
      set({ centers: [] })
    } finally {
      set({ loadingCenters: false })
    }
  },

  fetchOverview: async () => {
    const { filters } = get()
    const centerId = resolveCenterId(filters.centerIds)
    const management = getManagementLocale()

    set({ loadingOverview: true })

    try {
      const [summary, statistics, daily, cancellations] = await Promise.all([
        getRevenueSummary({
          centerId,
          from: filters.from,
          to: filters.to,
          status: filters.status === "all" ? undefined : filters.status,
          method: filters.method === "all" ? undefined : filters.method,
        }),
        getRevenueStatistics({
          centerId,
          from: filters.from,
          to: filters.to,
        }),
        getRevenueDailyStatistics({
          centerId,
          from: filters.from,
          to: filters.to,
        }),
        getRevenueCancellations({
          centerId,
          from: filters.from,
          to: filters.to,
        }),
      ])

      set({
        summary,
        statistics,
        daily,
        cancellations,
        permissionDenied: false,
      })
    } catch (error) {
      console.error("[RevenueReport] fetchOverview error:", error)

      set({
        summary: null,
        statistics: null,
        daily: null,
        cancellations: null,
        permissionDenied: isPermissionError(error),
        error: management.revenue.toast.errorDescription,
      })
    } finally {
      set({ loadingOverview: false })
    }
  },

  fetchTransactions: async () => {
    const { filters } = get()
    const centerId = resolveCenterId(filters.centerIds)
    const management = getManagementLocale()

    set({ loadingTransactions: true })

    try {
      const result = await getRevenueTransactions({
        centerId,
        from: filters.from,
        to: filters.to,
        status: filters.status === "all" ? undefined : filters.status,
        method: filters.method === "all" ? undefined : filters.method,
        limit: filters.limit,
        offset: filters.offset,
      })

      set({
        transactions: result.data,
        pagination: result.pagination ?? null,
        permissionDenied: false,
      })
    } catch (error) {
      console.error("[RevenueReport] fetchTransactions error:", error)

      set({
        transactions: [],
        pagination: null,
        permissionDenied: isPermissionError(error),
        error: management.revenue.toast.errorDescription,
      })
    } finally {
      set({ loadingTransactions: false })
    }
  },

  refreshAll: async () => {
    await Promise.all([get().fetchOverview(), get().fetchTransactions()])
  },

  exportCsv: async () => {
    const { filters } = get()
    const centerId = resolveCenterId(filters.centerIds)
    const management = getManagementLocale()

    set({ exporting: true })

    try {
      const url = await exportRevenueCsv({
        centerId,
        from: filters.from,
        to: filters.to,
        status: filters.status === "all" ? undefined : filters.status,
        method: filters.method === "all" ? undefined : filters.method,
      })

      return url
    } catch (error) {
      console.error("[RevenueReport] exportCsv error:", error)
      set({ error: management.revenue.toast.errorDescription })
      return null
    } finally {
      set({ exporting: false })
    }
  },

  setDateRange: (from, to) =>
    set((state) => ({
      filters: {
        ...state.filters,
        from,
        to,
        offset: 0,
      },
    })),

  setStatus: (status) =>
    set((state) => ({
      filters: {
        ...state.filters,
        status,
        offset: 0,
      },
    })),

  setMethod: (method) =>
    set((state) => ({
      filters: {
        ...state.filters,
        method,
        offset: 0,
      },
    })),

  toggleCenter: (centerId) =>
    set((state) => {
      if (centerId === "all") {
        return {
          filters: {
            ...state.filters,
            centerIds: [],
            offset: 0,
          },
        }
      }

      const nextCenters = state.filters.centerIds.includes(centerId)
        ? state.filters.centerIds.filter((id) => id !== centerId)
        : [...state.filters.centerIds, centerId]

      return {
        filters: {
          ...state.filters,
          centerIds: nextCenters,
          offset: 0,
        },
      }
    }),

  clearCenters: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        centerIds: [],
        offset: 0,
      },
    })),

  setLimit: (limit) =>
    set((state) => ({
      filters: {
        ...state.filters,
        limit,
        offset: 0,
      },
    })),

  setOffset: (offset) =>
    set((state) => ({
      filters: {
        ...state.filters,
        offset,
      },
    })),

  resetFilters: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        from: DEFAULT_RANGE.from,
        to: DEFAULT_RANGE.to,
        status: "all",
        method: "all",
        centerIds: [],
        limit: 20,
        offset: 0,
      },
    })),

  openTransaction: (transaction) =>
    set({ selectedTransactionId: transaction.id, detailOpen: true }),

  setDetailOpen: (open) => set({ detailOpen: open }),

  clearError: () => set({ error: null }),
}))
