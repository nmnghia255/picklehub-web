"use client"

import { useEffect, useMemo, useState } from "react"

import { PageContainer } from "@/components/page-container"
import type { Pagination as BookingListPagination } from "@/features/sport-center-management/actions/booking-actions"
import {
  confirmBookingAction,
  listBookingListAction,
} from "@/features/sport-center-management/actions/booking-actions"
import {
  BookingFilters,
  BookingListPageHeader,
  BookingListResults,
} from "@/features/sport-center-management/components/booking-list"
import type { BookingCreatedAtFilter } from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import {
  matchesCreatedAtFilter,
  sortBookingsByNewest,
} from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import { useBookingListStore } from "@/features/sport-center-management/stores/booking-list-store"
import { useCourtScheduleStore } from "@/features/sport-center-management/stores/court-schedule-store"
import type { Booking } from "@/features/sport-center-management/types/booking"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

const PAGE_SIZE = 20

interface BookingListPageContentProps {
  centerId: string | null
  loadingSportCenters: boolean
  sportCenters: Array<{ id: string; name: string }>
  createdAtFilter: BookingCreatedAtFilter
  statusFilter: "all" | Booking["status"]
  noContainer?: boolean
}

export function BookingListPageContent({
  centerId,
  loadingSportCenters,
  sportCenters,
  createdAtFilter,
  statusFilter,
  noContainer = false,
}: BookingListPageContentProps) {
  const { t } = useSportCenterManagementTranslation()
  const bookings = useBookingListStore((state) => state.bookings)
  const setBookings = useBookingListStore((state) => state.setBookings)
  const setIsLoadingBookings = useBookingListStore(
    (state) => state.setIsLoadingBookings
  )
  const setLoadError = useBookingListStore((state) => state.setLoadError)
  const isLoadingBookings = useBookingListStore(
    (state) => state.isLoadingBookings
  )
  const loadError = useBookingListStore((state) => state.loadError)
  const pendingAction = useBookingListStore((state) => state.pendingAction)

  const setCreatedAtFilter = useBookingListStore(
    (state) => state.setCreatedAtFilter
  )
  const setStatusFilter = useBookingListStore((state) => state.setStatusFilter)
  const resetFilters = useBookingListStore((state) => state.resetFilters)

  const [currentPage, setCurrentPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [pagination, setPagination] = useState<BookingListPagination | null>(
    null
  )

  useEffect(() => {
    if (!centerId) return
    let active = true

    const loadBookings = async () => {
      setIsLoadingBookings(true)
      setLoadError(null)

      const offset = (currentPage - 1) * PAGE_SIZE
      const statusParam = statusFilter === "all" ? "" : statusFilter
      const dateParam = createdAtFilter === "all" ? "" : createdAtFilter

      try {
        const response = await listBookingListAction(
          centerId,
          statusParam,
          "",
          dateParam,
          offset,
          PAGE_SIZE
        )

        if (!active) return

        setBookings(response.data)
        setPagination(response.pagination ?? null)
      } catch (error) {
        if (!active) return

        setLoadError(
          error instanceof Error
            ? error.message
            : t("bookingList.empty.loadErrorTitle")
        )
      } finally {
        if (active) {
          setIsLoadingBookings(false)
        }
      }
    }

    void loadBookings()

    return () => {
      active = false
    }
  }, [
    centerId,
    currentPage,
    createdAtFilter,
    statusFilter,
    refreshKey,
    setBookings,
    setIsLoadingBookings,
    setLoadError,
    t,
  ])

  const selectedCenter = useMemo(
    () => sportCenters.find((center) => center.id === centerId) ?? null,
    [centerId, sportCenters]
  )

  const activeBookings = useMemo(() => {
    if (!centerId) return []
    let list = bookings

    if (statusFilter !== "all") {
      list = list.filter((booking) => booking.status === statusFilter)
    }

    if (createdAtFilter !== "all") {
      list = list.filter((booking) =>
        matchesCreatedAtFilter(booking, createdAtFilter)
      )
    }

    return sortBookingsByNewest(list)
  }, [bookings, centerId, createdAtFilter, statusFilter])

  const paginationView = useMemo(() => {
    const pageSize = pagination?.limit ?? PAGE_SIZE
    const total = pagination?.total ?? activeBookings.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    return {
      currentPage,
      totalPages,
      total,
      pageSize,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    }
  }, [activeBookings.length, currentPage, pagination?.limit, pagination?.total])

  const bookingCounts = useMemo(() => {
    const pending = activeBookings.filter(
      (booking) => booking.status === "PENDING"
    ).length
    const confirmed = activeBookings.filter(
      (booking) => booking.status === "CONFIRMED"
    ).length

    return {
      total: paginationView.total,
      pending,
      confirmed,
    }
  }, [activeBookings, paginationView.total])

  const hasActiveFilters = createdAtFilter !== "all" || statusFilter !== "all"

  const refreshBookings = () => {
    setRefreshKey((value) => value + 1)
  }

  const handleConfirmBooking = async (booking: Booking) => {
    await confirmBookingAction(booking.id)
    refreshBookings()
  }

  const handleCancelBooking = (booking: Booking) => {
    refreshBookings()
  }

  const content = (
    <>
      <BookingListPageHeader totalBookings={bookingCounts.total} />

      <section className="space-y-5">
        <BookingFilters
          createdAtFilter={createdAtFilter}
          statusFilter={statusFilter}
          onCreatedAtFilterChange={setCreatedAtFilter}
          onStatusFilterChange={setStatusFilter}
          onResetFilters={resetFilters}
        />

        <BookingListResults
          isLoading={loadingSportCenters || isLoadingBookings}
          loadError={loadError}
          activeBookings={activeBookings}
          hasActiveFilters={hasActiveFilters}
          pagination={paginationView}
          onConfirmBooking={handleConfirmBooking}
          onCancelBooking={handleCancelBooking}
          onRefreshBookings={refreshBookings}
          onResetFilters={resetFilters}
          onRetry={refreshBookings}
          onPreviousPage={() => {
            if (!centerId || !paginationView.hasPreviousPage) return
            setCurrentPage((page) => Math.max(1, page - 1))
          }}
          onNextPage={() => {
            if (!centerId || !paginationView.hasNextPage) return
            setCurrentPage((page) => page + 1)
          }}
          pendingAction={pendingAction}
        />
      </section>
    </>
  )

  if (noContainer) {
    return <div className="space-y-6">{content}</div>
  }

  return (
    <PageContainer
      variant="wide"
      className="relative min-h-screen space-y-8 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,0.02),transparent)]" />
      <div className="pointer-events-none absolute top-16 right-0 -z-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
      {content}
    </PageContainer>
  )
}
