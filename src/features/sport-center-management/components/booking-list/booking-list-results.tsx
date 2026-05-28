"use client"

import { useState } from "react"

import type { Booking } from "../../types/booking"
import { BookingDetailDialog } from "./booking-detail-dialog/booking-detail-dialog"
import { BookingEmptyState } from "./booking-empty-state"
import { BookingListTable } from "./booking-list-table"

interface BookingListResultsProps {
  loadError: string | null
  activeBookings: Booking[]
  filteredBookings: Booking[]
  hasActiveFilters: boolean
  onConfirmBooking: (booking: Booking) => void
  onCancelBooking: (booking: Booking) => void
  onResetFilters: () => void
  onRetry: () => void
  pendingAction: { bookingId: string; action: "confirm" | "cancel" } | null
}

export function BookingListResults({
  loadError,
  activeBookings,
  filteredBookings,
  hasActiveFilters,
  onConfirmBooking,
  onCancelBooking,
  onResetFilters,
  onRetry,
  pendingAction,
}: BookingListResultsProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

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
    return (
      <BookingEmptyState
        title="Chưa có lượt đặt nào"
        description="Khi người chơi tạo lượt đặt mới, chúng sẽ xuất hiện ở đây để bạn theo dõi và xử lý."
        actionLabel="Làm mới"
        onAction={onRetry}
      />
    )
  }

  if (filteredBookings.length === 0) {
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
    <>
      <BookingListTable
        bookings={filteredBookings}
        onView={setSelectedBooking}
        onConfirmBooking={onConfirmBooking}
        onCancelBooking={onCancelBooking}
      />

      <BookingDetailDialog
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />

      {hasActiveFilters && filteredBookings.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Đang hiển thị {filteredBookings.length} / {activeBookings.length} lượt
          đặt.
        </p>
      )}
    </>
  )
}
