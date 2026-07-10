"use client"

import { useState } from "react"

import { Pagination } from "@/components/common/pagination"
import { cancelBookingAction } from "@/features/sport-center-management/actions/booking-actions"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../types/booking"
import { BookingDetailDialog } from "./booking-detail-dialog/booking-detail-dialog"
import { BookingEmptyState } from "./booking-empty-state"
import { BookingListSkeleton } from "./booking-list-skeleton"
import { BookingListTable } from "./booking-list-table"
import CancelReasonDialog from "./cancel-reason-dialog"

interface BookingListResultsProps {
  isLoading: boolean
  loadError: string | null
  activeBookings: Booking[]
  hasActiveFilters: boolean
  pagination: {
    currentPage: number
    totalPages: number
    total: number
    pageSize: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
  onConfirmBooking: (booking: Booking) => void
  onCancelBooking: (booking: Booking) => void
  onRefreshBookings: () => void
  onResetFilters: () => void
  onRetry: () => void
  onPreviousPage: () => void
  onNextPage: () => void
  pendingAction: { bookingId: string; action: "confirm" | "cancel" } | null
}

export function BookingListResults({
  isLoading,
  loadError,
  activeBookings,
  hasActiveFilters,
  pagination,
  onConfirmBooking,
  onCancelBooking,
  onRefreshBookings,
  onResetFilters,
  onRetry,
  onPreviousPage,
  onNextPage,
  pendingAction,
}: BookingListResultsProps) {
  const { t } = useSportCenterManagementTranslation()
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)

  if (isLoading) {
    return <BookingListSkeleton />
  }

  if (loadError) {
    return (
      <BookingEmptyState
        title={t("bookingList.empty.loadErrorTitle")}
        description={loadError}
        actionLabel={t("bookingList.empty.loadErrorAction")}
        onAction={onRetry}
      />
    )
  }

  if (activeBookings.length === 0) {
    if (hasActiveFilters) {
      return (
        <BookingEmptyState
          title={t("bookingList.empty.noResultsTitle")}
          description={t("bookingList.empty.noResultsDescription")}
          actionLabel={t("bookingList.empty.reset")}
          onAction={onResetFilters}
        />
      )
    }

    return (
      <BookingEmptyState
        title={t("bookingList.empty.noBookingsTitle")}
        description={t("bookingList.empty.noBookingsDescription")}
        actionLabel={t("bookingList.empty.refresh")}
        onAction={onRetry}
      />
    )
  }

  return (
    <>
      <BookingListTable
        bookings={activeBookings}
        onView={setSelectedBooking}
        onConfirmBooking={onConfirmBooking}
        onCancelBooking={(booking) => setCancelTarget(booking)}
      />

      <BookingDetailDialog
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onActionSuccess={onRefreshBookings}
      />

      <CancelReasonDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        onSubmit={async (reason) => {
          if (!cancelTarget) return
          await cancelBookingAction(cancelTarget.id, reason || undefined)
          setCancelTarget(null)
          onRefreshBookings()
          onCancelBooking(cancelTarget)
        }}
      />

      {pagination.totalPages > 1 && (
        <div className="mt-auto flex justify-center pt-6">
          <Pagination
            className="w-full"
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            hasPreviousPage={pagination.hasPreviousPage}
            hasNextPage={pagination.hasNextPage}
            onPreviousPage={onPreviousPage}
            onNextPage={onNextPage}
            variant="simple"
          />
        </div>
      )}
    </>
  )
}
