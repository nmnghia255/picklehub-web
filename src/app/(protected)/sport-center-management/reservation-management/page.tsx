"use client"

import { CalendarClock, Clock3, ShieldCheck } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"

import { PageContainer } from "@/components/page-container"

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
  MOCK_RESERVATIONS,
  type ReservationRecord,
  type ReservationStatus,
  type ReservationTabValue,
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

type SortValue =
  | "latest-hold"
  | "soonest-expiry"
  | "reservation-date"
  | "price-high"
  | "customer-a-z"

const sortOptions: Array<{ value: SortValue; label: string }> = [
  { value: "latest-hold", label: "Latest hold expiry" },
  { value: "soonest-expiry", label: "Soonest expiry" },
  { value: "reservation-date", label: "Reservation date" },
  { value: "price-high", label: "Highest price" },
  { value: "customer-a-z", label: "Customer A-Z" },
]

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

export default function ReservationManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [reservations, setReservations] = useState<ReservationRecord[]>(() =>
    createInitialReservations()
  )
  const [selectedTab, setSelectedTab] = useState<ReservationTabValue>("all")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | ReservationStatus>(
    "all"
  )
  const [courtFilter, setCourtFilter] = useState("all")
  const [sortBy, setSortBy] = useState<SortValue>("latest-hold")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null)
  const [detailOpen, setDetailOpen] = useState(false)

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

  const openReservation = (reservation: ReservationRecord) => {
    setSelectedReservationId(reservation.id)
    setDetailOpen(true)
  }

  const patchReservation = (
    reservationId: string,
    updater: (reservation: ReservationRecord) => ReservationRecord
  ) => {
    setReservations((current) =>
      current.map((reservation) =>
        reservation.id === reservationId ? updater(reservation) : reservation
      )
    )
  }

  const handleConfirmBooking = (reservation: ReservationRecord) => {
    patchReservation(reservation.id, (current) =>
      updateReservationState(
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
    )
  }

  const handleExtendHold = (reservation: ReservationRecord) => {
    patchReservation(reservation.id, (current) => {
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
    })
  }

  const handleMarkPaid = (reservation: ReservationRecord) => {
    patchReservation(reservation.id, (current) =>
      updateReservationState(
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
    )
  }

  const handleCancelReservation = (reservation: ReservationRecord) => {
    patchReservation(reservation.id, (current) =>
      updateReservationState(
        current,
        {
          status: "CANCELLED",
          countdownMode: "expired",
          countdownText: "Expired",
        },
        "Reservation cancelled",
        "Admin"
      )
    )
  }

  const handleViewReservation = (reservation: ReservationRecord) => {
    openReservation(reservation)
  }

  const handleResetMockReservations = () => {
    setReservations(createInitialReservations())
    setSelectedReservationId(null)
    setDetailOpen(false)
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
              onSortChange={(value) => setSortBy(value as SortValue)}
              onDateRangeChange={setDateRange}
              onReset={() => {
                setSearch("")
                setStatusFilter("all")
                setCourtFilter("all")
                setSortBy("latest-hold")
                setDateRange(undefined)
                setSelectedTab("all")
              }}
            />
          </div>
        </div>

        {reservations.length === 0 ? (
          <ReservationEmptyState
            title="No reservations yet"
            description="This admin view uses mock data only. Reset the dataset to bring the reservation list back."
            actionLabel="Restore mock reservations"
            onAction={handleResetMockReservations}
          />
        ) : filteredReservations.length === 0 ? (
          <ReservationEmptyState
            title="No matching reservations"
            description="Try another filter, date range, or search term to surface a different mock reservation set."
            actionLabel="Clear filters"
            onAction={() => {
              setSearch("")
              setStatusFilter("all")
              setCourtFilter("all")
              setSortBy("latest-hold")
              setDateRange(undefined)
              setSelectedTab("all")
            }}
          />
        ) : (
          <>
            <div className="hidden md:block">
              <ReservationTable
                reservations={filteredReservations}
                onView={handleViewReservation}
                onRowClick={openReservation}
                onConfirmBooking={handleConfirmBooking}
                onExtendHold={handleExtendHold}
                onMarkPaid={handleMarkPaid}
                onCancelReservation={handleCancelReservation}
              />
            </div>

            <div className="grid gap-4 md:hidden">
              {filteredReservations.map((reservation) => (
                <ReservationCardMobile
                  key={reservation.id}
                  reservation={reservation}
                  onView={handleViewReservation}
                  onOpen={openReservation}
                  onConfirmBooking={handleConfirmBooking}
                  onExtendHold={handleExtendHold}
                  onMarkPaid={handleMarkPaid}
                  onCancelReservation={handleCancelReservation}
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
        onConfirmBooking={handleConfirmBooking}
        onExtendHold={handleExtendHold}
        onMarkPaid={handleMarkPaid}
        onCancelReservation={handleCancelReservation}
      />
    </PageContainer>
  )
}
