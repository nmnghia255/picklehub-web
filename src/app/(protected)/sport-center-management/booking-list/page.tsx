"use client"

import { useEffect, useMemo } from "react"

import { PageContainer } from "@/components/page-container"
import {
  BookingListFiltersPanel,
  BookingListPageHeader,
  BookingListResults,
  BookingListSkeleton,
  BookingListStats,
} from "@/features/sport-center-management/components/booking-list"
import { sortBookingsByNewest } from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import useBookingListStore from "@/features/sport-center-management/stores/booking-list-store"
import { useCourtScheduleStore } from "@/features/sport-center-management/stores/court-schedule-store"
import type { Booking } from "@/features/sport-center-management/types/booking"

export default function Page() {
  const sportCenters = useCourtScheduleStore((state) => state.sportCenters)
  const centerId = useCourtScheduleStore((state) => state.centerId)
  const loadingSportCenters = useCourtScheduleStore(
    (state) => state.loadingSportCenters
  )

  const bookings = useBookingListStore((state) => state.bookings)
  const createdAtFilter = useBookingListStore((state) => state.createdAtFilter)
  const statusFilter = useBookingListStore((state) => state.statusFilter)
  const isLoadingBookings = useBookingListStore(
    (state) => state.isLoadingBookings
  )
  const loadError = useBookingListStore((state) => state.loadError)
  const pendingAction = useBookingListStore((state) => state.pendingAction)
  const pagination = useBookingListStore((state) => state.pagination)

  const loadBookings = useBookingListStore((state) => state.loadBookings)
  const confirmBooking = useBookingListStore((state) => state.confirmBooking)
  const cancelBooking = useBookingListStore((state) => state.cancelBooking)
  const setCreatedAtFilter = useBookingListStore(
    (state) => state.setCreatedAtFilter
  )
  const setStatusFilter = useBookingListStore((state) => state.setStatusFilter)
  const resetFilters = useBookingListStore((state) => state.resetFilters)

  useEffect(() => {
    if (!centerId) return
    void loadBookings(centerId, 1)
  }, [centerId, createdAtFilter, statusFilter, loadBookings])

  const selectedCenter = useMemo(
    () => sportCenters.find((center) => center.id === centerId) ?? null,
    [centerId, sportCenters]
  )

  const activeBookings = useMemo(
    () => (centerId ? sortBookingsByNewest(bookings) : []),
    [bookings, centerId]
  )

  const bookingCounts = useMemo(() => {
    const pending = activeBookings.filter(
      (booking) => booking.status === "PENDING"
    ).length
    const confirmed = activeBookings.filter(
      (booking) => booking.status === "CONFIRMED"
    ).length

    return {
      total: pagination?.total ?? activeBookings.length,
      pending,
      confirmed,
    }
  }, [activeBookings, pagination?.total])

  const currentPage = pagination
    ? Math.floor(pagination.offset / pagination.limit) + 1
    : 1
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.limit))
    : 1
  const hasPreviousPage = currentPage > 1
  const hasNextPage = currentPage < totalPages

  const hasActiveFilters = createdAtFilter !== "all" || statusFilter !== "all"

  const handleConfirmBooking = (booking: Booking) => {
    void confirmBooking(booking.id)
  }

  const handleCancelBooking = (booking: Booking) => {
    void cancelBooking(booking.id)
  }

  const shouldShowSkeleton = loadingSportCenters || isLoadingBookings

  if (shouldShowSkeleton) {
    return (
      <PageContainer
        variant="wide"
        className="relative min-h-screen overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,0.02),transparent)]" />
        <BookingListSkeleton />
      </PageContainer>
    )
  }

  return (
    <PageContainer
      variant="wide"
      className="relative min-h-screen space-y-8 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,0.02),transparent)]" />
      <div className="pointer-events-none absolute top-16 right-0 -z-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

      <BookingListPageHeader
        centerName={selectedCenter?.name ?? null}
        totalBookings={bookingCounts.total}
      />

      <BookingListStats bookingCounts={bookingCounts} />

      <section className="space-y-5">
        <BookingListFiltersPanel
          createdAtFilter={createdAtFilter}
          statusFilter={statusFilter}
          onCreatedAtFilterChange={setCreatedAtFilter}
          onStatusFilterChange={setStatusFilter}
          onResetFilters={resetFilters}
        />

        <BookingListResults
          loadError={loadError}
          activeBookings={activeBookings}
          hasActiveFilters={hasActiveFilters}
          pagination={{
            currentPage,
            totalPages,
            total: pagination?.total ?? activeBookings.length,
            pageSize: pagination?.limit ?? 0,
            hasPreviousPage,
            hasNextPage,
          }}
          onConfirmBooking={handleConfirmBooking}
          onCancelBooking={handleCancelBooking}
          onResetFilters={resetFilters}
          onRetry={() => window.location.reload()}
          onPreviousPage={() => {
            if (!centerId || !hasPreviousPage) return
            void loadBookings(centerId, currentPage - 1)
          }}
          onNextPage={() => {
            if (!centerId || !hasNextPage) return
            void loadBookings(centerId, currentPage + 1)
          }}
          pendingAction={pendingAction}
        />
      </section>
    </PageContainer>
  )
}
