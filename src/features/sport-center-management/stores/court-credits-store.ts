"use client"

import type { DateRange } from "react-day-picker"
import { create } from "zustand"

import {
  type CancellationReason,
  type CreditRecord,
  type CreditStatus,
  type CreditTabValue,
  MOCK_CREDITS,
} from "../credit-management/court-credits-data"

export type CreditSortValue =
  | "latest-created"
  | "soonest-expiry"
  | "credit-amount-high"
  | "remaining-high"
  | "customer-a-z"

export const DEFAULT_CREDIT_TAB: CreditTabValue = "all"
export const DEFAULT_CREDIT_STATUS_FILTER: "all" | CreditStatus = "all"
export const DEFAULT_CANCELLATION_REASON_FILTER: "all" | CancellationReason =
  "all"
export const DEFAULT_CREDIT_SORT: CreditSortValue = "latest-created"

function cloneCredits() {
  return MOCK_CREDITS.map((credit) => ({
    ...credit,
    usageHistory: credit.usageHistory.map((entry) => ({ ...entry })),
    timeline: credit.timeline.map((entry) => ({ ...entry })),
    auditLog: credit.auditLog.map((entry) => ({ ...entry })),
  }))
}

function stampCredit(
  credit: CreditRecord,
  updates: Partial<CreditRecord>,
  action: string,
  actor: string
) {
  const timestamp = new Date()

  return {
    ...credit,
    ...updates,
    timeline: [{ label: action, timestamp, actor }, ...credit.timeline],
    auditLog: [{ action, timestamp, actor }, ...credit.auditLog],
  }
}

export interface CreditManagementState {
  credits: CreditRecord[]
  selectedTab: CreditTabValue
  search: string
  statusFilter: "all" | CreditStatus
  cancellationReasonFilter: "all" | CancellationReason
  courtFilter: string
  sortBy: CreditSortValue
  dateRange: DateRange | undefined
  selectedCreditId: string | null
  detailOpen: boolean
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  setSelectedTab: (selectedTab: CreditTabValue) => void
  setSearch: (search: string) => void
  setStatusFilter: (statusFilter: "all" | CreditStatus) => void
  setCancellationReasonFilter: (
    cancellationReasonFilter: "all" | CancellationReason
  ) => void
  setCourtFilter: (courtFilter: string) => void
  setSortBy: (sortBy: CreditSortValue) => void
  setDateRange: (dateRange: DateRange | undefined) => void
  openCredit: (credit: CreditRecord) => void
  setDetailOpen: (detailOpen: boolean) => void
  extendExpirationDate: (credit: CreditRecord) => void
  markExpired: (credit: CreditRecord) => void
  cancelCredit: (credit: CreditRecord) => void
  createManualCredit: (credit: CreditRecord) => void
  resetFilters: () => void
  resetMockCredits: () => void
}

export const useCreditManagementStore = create<CreditManagementState>(
  (set) => ({
    credits: cloneCredits(),
    selectedTab: DEFAULT_CREDIT_TAB,
    search: "",
    statusFilter: DEFAULT_CREDIT_STATUS_FILTER,
    cancellationReasonFilter: DEFAULT_CANCELLATION_REASON_FILTER,
    courtFilter: "all",
    sortBy: DEFAULT_CREDIT_SORT,
    dateRange: undefined,
    selectedCreditId: null,
    detailOpen: false,
    isLoading: true,

    setIsLoading: (isLoading) => set({ isLoading }),
    setSelectedTab: (selectedTab) => set({ selectedTab }),
    setSearch: (search) => set({ search }),
    setStatusFilter: (statusFilter) => set({ statusFilter }),
    setCancellationReasonFilter: (cancellationReasonFilter) =>
      set({ cancellationReasonFilter }),
    setCourtFilter: (courtFilter) => set({ courtFilter }),
    setSortBy: (sortBy) => set({ sortBy }),
    setDateRange: (dateRange) => set({ dateRange }),
    openCredit: (credit) =>
      set({ selectedCreditId: credit.id, detailOpen: true }),
    setDetailOpen: (detailOpen) => set({ detailOpen }),
    extendExpirationDate: (credit) =>
      set((state) => ({
        credits: state.credits.map((current) => {
          if (current.id !== credit.id) return current

          const nextExpirationDate = new Date(current.expirationDate)
          nextExpirationDate.setDate(nextExpirationDate.getDate() + 14)

          return stampCredit(
            current,
            { expirationDate: nextExpirationDate },
            "Expiration date extended by 14 days",
            "Admin"
          )
        }),
      })),
    markExpired: (credit) =>
      set((state) => ({
        credits: state.credits.map((current) =>
          current.id === credit.id
            ? stampCredit(
                current,
                { status: "EXPIRED" },
                "Credit marked expired",
                "Admin"
              )
            : current
        ),
      })),
    cancelCredit: (credit) =>
      set((state) => ({
        credits: state.credits.map((current) =>
          current.id === credit.id
            ? stampCredit(
                current,
                { status: "EXPIRED", remainingAmount: 0 },
                "Credit cancelled",
                "Admin"
              )
            : current
        ),
      })),
    createManualCredit: (credit) =>
      set((state) => {
        const now = new Date()
        const newCredit: CreditRecord = stampCredit(
          {
            ...credit,
            id: `CRD-MANUAL-${now.getTime().toString().slice(-5)}`,
            creditCode: `CRD-MANUAL-${now.getTime().toString().slice(-5)}`,
            creditAmount: 100000,
            remainingAmount: 100000,
            status: "ACTIVE",
            createdAt: now,
            expirationDate: new Date(now.getTime() + 45 * 24 * 60 * 60_000),
            cancellationReason: credit.cancellationReason,
            notes: "Manual credit created by admin.",
            manualCredit: true,
            usageHistory: [],
            timeline: [],
            auditLog: [],
          },
          { notes: "Manual credit created by admin." },
          "Manual credit created",
          "Admin"
        )

        return { credits: [newCredit, ...state.credits] }
      }),
    resetFilters: () =>
      set({
        selectedTab: DEFAULT_CREDIT_TAB,
        search: "",
        statusFilter: DEFAULT_CREDIT_STATUS_FILTER,
        cancellationReasonFilter: DEFAULT_CANCELLATION_REASON_FILTER,
        courtFilter: "all",
        sortBy: DEFAULT_CREDIT_SORT,
        dateRange: undefined,
      }),
    resetMockCredits: () =>
      set({
        credits: cloneCredits(),
        selectedCreditId: null,
        detailOpen: false,
      }),
  })
)
