"use client"

import type { DateRange } from "react-day-picker"
import { create } from "zustand"

import { MOCK_RESERVATIONS } from "../../../app/(protected)/sport-center-management/reservation-management/mock-data"
import type {
  ReservationRecord,
  ReservationStatus,
  ReservationTabValue,
} from "../types/reservation"

export type ReservationSortValue =
  | "latest-hold"
  | "soonest-expiry"
  | "reservation-date"
  | "price-high"
  | "customer-a-z"

export const DEFAULT_RESERVATION_TAB: ReservationTabValue = "all"
export const DEFAULT_RESERVATION_STATUS_FILTER: "all" | ReservationStatus =
  "all"
export const DEFAULT_RESERVATION_COURT_FILTER = "all"
export const DEFAULT_RESERVATION_SORT: ReservationSortValue = "latest-hold"

function createInitialReservations() {
  return MOCK_RESERVATIONS.map((reservation) => ({
    ...reservation,
    timeline: reservation.timeline.map((entry) => ({ ...entry })),
    auditLog: reservation.auditLog.map((entry) => ({ ...entry })),
  }))
}

function updateReservationState(
  reservation: ReservationRecord,
  updates: Partial<ReservationRecord>,
  auditMessage: string,
  actor: string
) {
  const timestamp = new Date()

  return {
    ...reservation,
    ...updates,
    updatedAt: timestamp,
    timeline: [
      {
        label: auditMessage,
        timestamp,
        actor,
      },
      ...reservation.timeline,
    ],
    auditLog: [
      {
        action: auditMessage,
        timestamp,
        actor,
      },
      ...reservation.auditLog,
    ],
  }
}

export interface ReservationManagementState {
  reservations: ReservationRecord[]
  selectedTab: ReservationTabValue
  search: string
  statusFilter: "all" | ReservationStatus
  courtFilter: string
  sortBy: ReservationSortValue
  dateRange: DateRange | undefined
  selectedReservationId: string | null
  detailOpen: boolean
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  setSelectedTab: (selectedTab: ReservationTabValue) => void
  setSearch: (search: string) => void
  setStatusFilter: (statusFilter: "all" | ReservationStatus) => void
  setCourtFilter: (courtFilter: string) => void
  setSortBy: (sortBy: ReservationSortValue) => void
  setDateRange: (dateRange: DateRange | undefined) => void
  openReservation: (reservation: ReservationRecord) => void
  setDetailOpen: (detailOpen: boolean) => void
  confirmBooking: (reservation: ReservationRecord) => void
  extendHold: (reservation: ReservationRecord) => void
  markPaid: (reservation: ReservationRecord) => void
  cancelReservation: (reservation: ReservationRecord) => void
  resetFilters: () => void
  resetMockReservations: () => void
}

export const useReservationManagementStore = create<ReservationManagementState>(
  (set) => ({
    reservations: createInitialReservations(),
    selectedTab: DEFAULT_RESERVATION_TAB,
    search: "",
    statusFilter: DEFAULT_RESERVATION_STATUS_FILTER,
    courtFilter: DEFAULT_RESERVATION_COURT_FILTER,
    sortBy: DEFAULT_RESERVATION_SORT,
    dateRange: undefined,
    selectedReservationId: null,
    detailOpen: false,
    isLoading: true,

    setIsLoading: (isLoading) => set({ isLoading }),
    setSelectedTab: (selectedTab) => set({ selectedTab }),
    setSearch: (search) => set({ search }),
    setStatusFilter: (statusFilter) => set({ statusFilter }),
    setCourtFilter: (courtFilter) => set({ courtFilter }),
    setSortBy: (sortBy) => set({ sortBy }),
    setDateRange: (dateRange) => set({ dateRange }),
    openReservation: (reservation) =>
      set({ selectedReservationId: reservation.id, detailOpen: true }),
    setDetailOpen: (detailOpen) => set({ detailOpen }),
    confirmBooking: (reservation) =>
      set((state) => ({
        reservations: state.reservations.map((current) =>
          current.id === reservation.id
            ? updateReservationState(
                current,
                {
                  status: "CONFIRMED",
                  paymentStatus: "PAID",
                  confirmedAt: new Date(),
                  paymentAttemptAt: current.paymentAttemptAt ?? new Date(),
                  countdownMode: "expiresAt",
                  countdownText: `Expires at ${current.holdExpiresAt.toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}`,
                },
                "Booking confirmed",
                "Admin"
              )
            : current
        ),
      })),
    extendHold: (reservation) =>
      set((state) => ({
        reservations: state.reservations.map((current) => {
          if (current.id !== reservation.id) return current

          const nextExpiresAt = new Date(current.holdExpiresAt)
          nextExpiresAt.setMinutes(nextExpiresAt.getMinutes() + 15)

          return updateReservationState(
            current,
            {
              holdExpiresAt: nextExpiresAt,
              countdownMode: "remaining",
              countdownText: `${current.countdownText} · extended`,
            },
            "Hold extended by 15 minutes",
            "Admin"
          )
        }),
      })),
    markPaid: (reservation) =>
      set((state) => ({
        reservations: state.reservations.map((current) =>
          current.id === reservation.id
            ? updateReservationState(
                current,
                {
                  paymentStatus: "PAID",
                  paymentAttemptAt: current.paymentAttemptAt ?? new Date(),
                  transactionId:
                    current.transactionId ??
                    `TXN-${current.id.slice(-4)}-${Date.now().toString().slice(-4)}`,
                },
                "Marked as paid",
                "Cashier"
              )
            : current
        ),
      })),
    cancelReservation: (reservation) =>
      set((state) => ({
        reservations: state.reservations.map((current) =>
          current.id === reservation.id
            ? updateReservationState(
                current,
                {
                  status: "CANCELLED",
                  countdownMode: "expired",
                  countdownText: "Expired",
                },
                "Reservation cancelled",
                "Admin"
              )
            : current
        ),
      })),
    resetFilters: () =>
      set({
        selectedTab: DEFAULT_RESERVATION_TAB,
        search: "",
        statusFilter: DEFAULT_RESERVATION_STATUS_FILTER,
        courtFilter: DEFAULT_RESERVATION_COURT_FILTER,
        sortBy: DEFAULT_RESERVATION_SORT,
        dateRange: undefined,
      }),
    resetMockReservations: () =>
      set({
        reservations: createInitialReservations(),
        selectedReservationId: null,
        detailOpen: false,
      }),
  })
)
