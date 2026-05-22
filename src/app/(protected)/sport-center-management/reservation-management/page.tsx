"use client"

import { CalendarClock, Clock3, ShieldCheck } from "lucide-react"
import { useEffect, useMemo } from "react"

import { PageContainer } from "@/components/page-container"
import {
  type ReservationSortValue,
  useReservationManagementStore,
} from "@/features/sport-center-management/stores/reservation-management-store"

import { ReservationCardMobile } from "../../../../features/sport-center-management/components/reservation-management/reservation-card-mobile"
import { ReservationDetailDrawer } from "../../../../features/sport-center-management/components/reservation-management/reservation-detail-drawer"
import { ReservationEmptyState } from "../../../../features/sport-center-management/components/reservation-management/reservation-empty-state"
import { ReservationFilters } from "../../../../features/sport-center-management/components/reservation-management/reservation-filters"
import { ReservationPageSkeleton } from "../../../../features/sport-center-management/components/reservation-management/reservation-skeleton"
import { ReservationStats } from "../../../../features/sport-center-management/components/reservation-management/reservation-stats"
import { ReservationTable } from "../../../../features/sport-center-management/components/reservation-management/reservation-table"
import { ReservationTabs } from "../../../../features/sport-center-management/components/reservation-management/reservation-tabs"
import {
  COURT_OPTIONS,
  isExpiringSoon,
  type ReservationRecord,
  type ReservationStatus,
} from "./mock-data"

const statusFilterOptions: Array<{
  value: "all" | ReservationStatus
  label: string
}> = [
  { value: "all", label: "All statuses" },
  { value: "HOLDING", label: "Holding" },
  { value: "AWAITING_PAYMENT", label: "Awaiting payment" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
]

const sortOptions: Array<{ value: ReservationSortValue; label: string }> = [
  { value: "latest-hold", label: "Latest hold expiry" },
  { value: "soonest-expiry", label: "Soonest expiry" },
  { value: "reservation-date", label: "Reservation date" },
  { value: "price-high", label: "Highest price" },
  { value: "customer-a-z", label: "Customer A-Z" },
]

export default function ReservationManagementPage() {
  const isLoading = useReservationManagementStore((state) => state.isLoading)
  const reservations = useReservationManagementStore(
    (state) => state.reservations
  )
  const selectedTab = useReservationManagementStore(
    (state) => state.selectedTab
  )
  const search = useReservationManagementStore((state) => state.search)
  const statusFilter = useReservationManagementStore(
    (state) => state.statusFilter
  )
  const courtFilter = useReservationManagementStore(
    (state) => state.courtFilter
  )
  const sortBy = useReservationManagementStore((state) => state.sortBy)
  const dateRange = useReservationManagementStore((state) => state.dateRange)
  const selectedReservationId = useReservationManagementStore(
    (state) => state.selectedReservationId
  )
  const detailOpen = useReservationManagementStore((state) => state.detailOpen)
  const setIsLoading = useReservationManagementStore(
    (state) => state.setIsLoading
  )
  const setSelectedTab = useReservationManagementStore(
    (state) => state.setSelectedTab
  )
  const setSearch = useReservationManagementStore((state) => state.setSearch)
  const setStatusFilter = useReservationManagementStore(
    (state) => state.setStatusFilter
  )
  const setCourtFilter = useReservationManagementStore(
    (state) => state.setCourtFilter
  )
  const setSortBy = useReservationManagementStore((state) => state.setSortBy)
  const setDateRange = useReservationManagementStore(
    (state) => state.setDateRange
  )
  const openReservation = useReservationManagementStore(
    (state) => state.openReservation
  )
  const setDetailOpen = useReservationManagementStore(
    (state) => state.setDetailOpen
  )
  const confirmBooking = useReservationManagementStore(
    (state) => state.confirmBooking
  )
  const extendHold = useReservationManagementStore((state) => state.extendHold)
  const markPaid = useReservationManagementStore((state) => state.markPaid)
  const cancelReservation = useReservationManagementStore(
    (state) => state.cancelReservation
  )
  const resetFilters = useReservationManagementStore(
    (state) => state.resetFilters
  )
  const resetMockReservations = useReservationManagementStore(
    (state) => state.resetMockReservations
  )

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 650)
    return () => window.clearTimeout(timer)
  }, [])

  const selectedReservation = useMemo(() => {
    return (
      reservations.find((item) => item.id === selectedReservationId) ?? null
    )
  }, [reservations, selectedReservationId])

  const filteredReservations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const matchesTab = (reservation: ReservationRecord) => {
      switch (selectedTab) {
        case "active":
          return (
            reservation.status === "HOLDING" ||
            reservation.status === "AWAITING_PAYMENT"
          )
        case "awaiting-payment":
          return reservation.status === "AWAITING_PAYMENT"
        case "expiring-soon":
          return isExpiringSoon(reservation)
        case "confirmed":
          return reservation.status === "CONFIRMED"
        case "cancelled":
          return reservation.status === "CANCELLED"
        default:
          return true
      }
    }

    const inSelectedRange = (reservation: ReservationRecord) => {
      if (!dateRange?.from && !dateRange?.to) return true

      const reservationDate = new Date(reservation.reservationDate)
      const from = dateRange?.from ? new Date(dateRange.from) : null
      const to = dateRange?.to ? new Date(dateRange.to) : null

      if (from) {
        from.setHours(0, 0, 0, 0)
        if (reservationDate < from) return false
      }

      if (to) {
        to.setHours(23, 59, 59, 999)
        if (reservationDate > to) return false
      }

      return true
    }

    const sorted = reservations
      .filter((reservation) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          [
            reservation.id,
            reservation.customerName,
            reservation.phone,
            reservation.courtName,
            reservation.source,
            reservation.notes,
            reservation.timeSlot,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)

        const matchesStatus =
          statusFilter === "all" || reservation.status === statusFilter
        const matchesCourt =
          courtFilter === "all" || reservation.courtId === courtFilter

        return (
          matchesTab(reservation) &&
          matchesSearch &&
          matchesStatus &&
          matchesCourt &&
          inSelectedRange(reservation)
        )
      })
      .sort((left, right) => {
        switch (sortBy) {
          case "soonest-expiry":
            return (
              new Date(left.holdExpiresAt).getTime() -
              new Date(right.holdExpiresAt).getTime()
            )
          case "reservation-date":
            return (
              new Date(left.reservationDate).getTime() -
              new Date(right.reservationDate).getTime()
            )
          case "price-high":
            return right.totalPrice - left.totalPrice
          case "customer-a-z":
            return left.customerName.localeCompare(right.customerName)
          case "latest-hold":
          default:
            return (
              new Date(right.holdExpiresAt).getTime() -
              new Date(left.holdExpiresAt).getTime()
            )
        }
      })

    return sorted
  }, [
    courtFilter,
    dateRange,
    reservations,
    search,
    selectedTab,
    sortBy,
    statusFilter,
  ])

  const stats = useMemo(() => {
    return {
      totalReservations: reservations.length,
      activeHolds: reservations.filter(
        (reservation) =>
          reservation.status === "HOLDING" ||
          reservation.status === "AWAITING_PAYMENT"
      ).length,
      expiringSoon: reservations.filter((reservation) =>
        isExpiringSoon(reservation)
      ).length,
      confirmed: reservations.filter(
        (reservation) => reservation.status === "CONFIRMED"
      ).length,
      expired: reservations.filter(
        (reservation) => reservation.status === "EXPIRED"
      ).length,
    }
  }, [reservations])

  const handleViewReservation = (reservation: ReservationRecord) => {
    openReservation(reservation)
  }

  if (isLoading) {
    return (
      <PageContainer variant="wide" className="relative min-h-screen">
        <ReservationPageSkeleton />
      </PageContainer>
    )
  }

  return (
    <PageContainer
      variant="wide"
      className="relative min-h-screen space-y-8 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,0.02),transparent)]" />
      <div className="pointer-events-none absolute top-16 right-0 -z-10 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

      <section className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              Temporary reservation control panel
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Reservation management
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Monitor temporary court holds, review countdowns, and manage the
                booking lifecycle before reservations become confirmed bookings.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-2 shadow-sm backdrop-blur">
              <CalendarClock className="size-4 text-sky-500" />
              {reservations.length} mock reservations
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-2 shadow-sm backdrop-blur">
              <Clock3 className="size-4 text-amber-500" />
              {stats.expiringSoon} expiring soon
            </div>
          </div>
        </div>
      </section>

      <ReservationStats
        totalReservations={stats.totalReservations}
        activeHolds={stats.activeHolds}
        expiringSoon={stats.expiringSoon}
        confirmed={stats.confirmed}
        expired={stats.expired}
      />

      <section className="space-y-5">
        <div className="sticky top-4 z-30 -mx-1">
          <div className="space-y-4 rounded-3xl border bg-background/95 p-4 shadow-lg shadow-slate-950/5 backdrop-blur supports-backdrop-filter:bg-background/85 sm:p-5">
            <ReservationTabs
              value={selectedTab}
              onValueChange={setSelectedTab}
            />

            <ReservationFilters
              search={search}
              statusFilter={statusFilter}
              courtFilter={courtFilter}
              sortBy={sortBy}
              dateRange={dateRange}
              courts={COURT_OPTIONS}
              statusOptions={statusFilterOptions}
              sortOptions={sortOptions}
              onSearchChange={setSearch}
              onStatusFilterChange={setStatusFilter}
              onCourtFilterChange={setCourtFilter}
              onSortChange={(value) => setSortBy(value as ReservationSortValue)}
              onDateRangeChange={setDateRange}
              onReset={resetFilters}
            />
          </div>
        </div>

        {reservations.length === 0 ? (
          <ReservationEmptyState
            title="No reservations yet"
            description="This admin view uses mock data only. Reset the dataset to bring the reservation list back."
            actionLabel="Restore mock reservations"
            onAction={resetMockReservations}
          />
        ) : filteredReservations.length === 0 ? (
          <ReservationEmptyState
            title="No matching reservations"
            description="Try another filter, date range, or search term to surface a different mock reservation set."
            actionLabel="Clear filters"
            onAction={resetFilters}
          />
        ) : (
          <>
            <div className="hidden md:block">
              <ReservationTable
                reservations={filteredReservations}
                onView={handleViewReservation}
                onRowClick={openReservation}
                onConfirmBooking={confirmBooking}
                onExtendHold={extendHold}
                onMarkPaid={markPaid}
                onCancelReservation={cancelReservation}
              />
            </div>

            <div className="grid gap-4 md:hidden">
              {filteredReservations.map((reservation) => (
                <ReservationCardMobile
                  key={reservation.id}
                  reservation={reservation}
                  onView={handleViewReservation}
                  onOpen={openReservation}
                  onConfirmBooking={confirmBooking}
                  onExtendHold={extendHold}
                  onMarkPaid={markPaid}
                  onCancelReservation={cancelReservation}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <ReservationDetailDrawer
        reservation={selectedReservation}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onConfirmBooking={confirmBooking}
        onExtendHold={extendHold}
        onMarkPaid={markPaid}
        onCancelReservation={cancelReservation}
      />
    </PageContainer>
  )
}
