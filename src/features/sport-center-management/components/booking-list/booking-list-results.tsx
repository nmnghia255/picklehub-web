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
import { cancelBookingAction } from "@/features/sport-center-management/actions/booking-actions"

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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)

  if (isLoading) {
    return <BookingListSkeleton />
  }

  if (loadError) {
    return (
      <BookingEmptyState
        title="Không thể tải danh sách đặt sân"
        description={loadError}
        actionLabel="Thử lại"
        onAction={onRetry}
      />
    )
  }

  if (activeBookings.length === 0) {
    if (hasActiveFilters) {
      return (
        <BookingEmptyState
          title="Không có kết quả phù hợp"
          description="Hãy thử thay đổi bộ lọc ngày tạo hoặc trạng thái để xem các lượt đặt khác."
          actionLabel="Xóa bộ lọc"
          onAction={onResetFilters}
        />
      )
    }

    return (
      <BookingEmptyState
        title="Chưa có lượt đặt nào"
        description="Khi người chơi tạo lượt đặt mới, chúng sẽ xuất hiện ở đây để bạn theo dõi và xử lý."
        actionLabel="Làm mới"
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
                  Trang {pagination.currentPage}
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
