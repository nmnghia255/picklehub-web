"use client"

import { useEffect, useMemo, useState } from "react"

import { PageContainer } from "@/components/page-container"
import { BookingHistoryFilters } from "@/features/sport-center/components/booking-history/booking-history-filters"
import { BookingHistoryPageHeader } from "@/features/sport-center/components/booking-history/booking-history-page-header"
import { BookingHistoryResults } from "@/features/sport-center/components/booking-history/booking-history-results"
import type {
  BookingResponse,
  MyBookingsResponse,
} from "@/features/sport-center/types/booking"

import type {
  BookingHistoryPagination,
  BookingHistoryStatusFilter,
} from "./booking-history.types"
import { sortBookingsByNewest } from "./booking-history.utils"

const PAGE_SIZE = 20

export default function Page() {
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [pagination, setPagination] = useState<{
    total: number
    limit: number
    offset: number
  } | null>(null)
  const [statusFilter, setStatusFilter] =
    useState<BookingHistoryStatusFilter>("all")
  const [dateFilter, setDateFilter] = useState("")

  useEffect(() => {
    let active = true

    const loadBookings = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const searchParams = new URLSearchParams()

        if (statusFilter !== "all") {
          searchParams.set("status", statusFilter)
        }

        if (dateFilter) {
          searchParams.set("date", dateFilter)
        }

        searchParams.set("limit", String(PAGE_SIZE))
        searchParams.set("offset", String((currentPage - 1) * PAGE_SIZE))

        const response = await fetch(
          `/api/bookings/me?${searchParams.toString()}`
        )

        const payload = (await response.json().catch(() => ({}))) as {
          message?: string
          data?: MyBookingsResponse["data"]
          pagination?: MyBookingsResponse["pagination"]
        }

        if (!response.ok) {
          throw new Error(payload.message || "Không thể tải lịch sử đặt sân")
        }

        if (!active) return

        setBookings(payload.data ?? [])
        setPagination(payload.pagination ?? null)
      } catch (error) {
        if (!active) return

        setLoadError(
          error instanceof Error
            ? error.message
            : "Không thể tải lịch sử đặt sân"
        )
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadBookings()

    return () => {
      active = false
    }
  }, [currentPage, dateFilter, refreshKey, statusFilter])

  const sortedBookings = useMemo(
    () => sortBookingsByNewest(bookings),
    [bookings]
  )

  const paginationView = useMemo<BookingHistoryPagination>(() => {
    const total = pagination?.total ?? sortedBookings.length
    const limit = pagination?.limit ?? PAGE_SIZE
    const totalPages = Math.max(1, Math.ceil(total / limit))

    return {
      currentPage,
      totalPages,
      total,
      pageSize: limit,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    }
  }, [currentPage, pagination?.limit, pagination?.total, sortedBookings.length])

  const hasActiveFilters = statusFilter !== "all" || Boolean(dateFilter)

  const refreshBookings = () => {
    setRefreshKey((value) => value + 1)
  }

  const resetFilters = () => {
    setStatusFilter("all")
    setDateFilter("")
    setCurrentPage(1)
  }

  const totalBookings = pagination?.total ?? sortedBookings.length

  return (
    <PageContainer
      variant="wide"
      className="relative min-h-screen space-y-8 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,0.02),transparent)]" />
      <div className="pointer-events-none absolute top-16 right-0 -z-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

      <BookingHistoryPageHeader totalBookings={totalBookings} />

      <section className="space-y-5">
        <BookingHistoryFilters
          statusFilter={statusFilter}
          dateFilter={dateFilter}
          hasActiveFilters={hasActiveFilters}
          onStatusFilterChange={(value) => {
            setCurrentPage(1)
            setStatusFilter(value)
          }}
          onDateFilterChange={(value) => {
            setCurrentPage(1)
            setDateFilter(value)
          }}
          onRefresh={refreshBookings}
          onResetFilters={resetFilters}
        />

        <BookingHistoryResults
          bookings={sortedBookings}
          isLoading={isLoading}
          loadError={loadError}
          hasActiveFilters={hasActiveFilters}
          pagination={paginationView}
          onRetry={refreshBookings}
          onResetFilters={resetFilters}
          onPreviousPage={() => {
            if (!paginationView.hasPreviousPage) return
            setCurrentPage((page) => Math.max(1, page - 1))
          }}
          onNextPage={() => {
            if (!paginationView.hasNextPage) return
            setCurrentPage((page) => page + 1)
          }}
          onRefresh={refreshBookings}
        />
      </section>
    </PageContainer>
  )
}
