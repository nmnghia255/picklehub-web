"use client"

import { useState } from "react"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { BookingResponse } from "@/features/sport-center/types/booking"
import CancelReasonDialog from "@/features/sport-center-management/components/booking-list/cancel-reason-dialog"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

import type { BookingHistoryPagination } from "../../../../app/(protected)/sport-center/booking-history/booking-history.types"
import { BookingHistoryDetailDialog } from "./booking-history-detail-dialog"
import { BookingHistoryEmptyState } from "./booking-history-empty-state"
import { BookingHistorySkeleton } from "./booking-history-skeleton"
import { BookingHistoryTable } from "./booking-history-table"

interface BookingHistoryResultsProps {
  bookings: BookingResponse[]
  isLoading: boolean
  loadError: string | null
  hasActiveFilters: boolean
  pagination: BookingHistoryPagination
  onRetry: () => void
  onResetFilters: () => void
  onPreviousPage: () => void
  onNextPage: () => void
  onRefresh: () => void
}

export function BookingHistoryResults({
  bookings,
  isLoading,
  loadError,
  hasActiveFilters,
  pagination,
  onRetry,
  onResetFilters,
  onPreviousPage,
  onNextPage,
  onRefresh,
}: BookingHistoryResultsProps) {
  const { t } = useSportCenterTranslation()
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponse | null>(null)
  const [cancelTarget, setCancelTarget] = useState<BookingResponse | null>(null)

  if (isLoading) {
    return <BookingHistorySkeleton />
  }

  if (loadError) {
    return (
      <BookingHistoryEmptyState
        title={t("booking.history.loadErrorTitle")}
        description={loadError}
        actionLabel={t("booking.history.retry")}
        onAction={onRetry}
      />
    )
  }

  const handleCancelBooking = async (reason: string) => {
    if (!cancelTarget) return

    const response = await fetch(`/api/bookings/${cancelTarget.id}/cancel`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    })

    const payload = (await response.json().catch(() => ({}))) as {
      message?: string
    }

    if (!response.ok) {
      throw new Error(payload.message || t("booking.history.cancelErrorDesc"))
    }

    setCancelTarget(null)
    onRefresh()
  }

  if (bookings.length === 0) {
    return (
      <BookingHistoryEmptyState
        title={
          hasActiveFilters
            ? t("booking.history.noResults")
            : t("booking.history.noBookings")
        }
        description={
          hasActiveFilters
            ? t("booking.history.tryChangeFilters")
            : t("booking.history.noBookingsDesc")
        }
        actionLabel={
          hasActiveFilters
            ? t("booking.history.clearFilters")
            : t("booking.history.refresh")
        }
        onAction={hasActiveFilters ? onResetFilters : onRetry}
      />
    )
  }

  return (
    <>
      <BookingHistoryTable
        bookings={bookings}
        onView={setSelectedBooking}
        onCancel={setCancelTarget}
      />

      <BookingHistoryDetailDialog
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onActionSuccess={onRefresh}
      />

      <CancelReasonDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title={t("booking.history.cancelBookingTitle")}
        description={t("booking.history.cancelReasonDescResult")}
        submitLabel={t("booking.history.confirmCancel")}
        onSubmit={handleCancelBooking}
      />

      {pagination.totalPages > 1 && (
        <div className="mt-auto flex justify-center pt-2">
          <Pagination className="w-full">
            <PaginationContent className="justify-center">
              <PaginationItem>
                {pagination.hasPreviousPage ? (
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      onPreviousPage()
                    }}
                  />
                ) : (
                  <span className="inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2.5 text-sm font-medium opacity-50">
                    Previous
                  </span>
                )}
              </PaginationItem>

              <PaginationItem>
                <PaginationLink isActive size="default" href="#">
                  {t("booking.history.page", {
                    page: pagination.currentPage,
                    defaultValue: `Trang ${pagination.currentPage}`,
                  })}
                </PaginationLink>
              </PaginationItem>

              <PaginationItem>
                {pagination.hasNextPage ? (
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      onNextPage()
                    }}
                  />
                ) : (
                  <span className="inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2.5 text-sm font-medium opacity-50">
                    Next
                  </span>
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  )
}
