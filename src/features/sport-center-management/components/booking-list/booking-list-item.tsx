"use client"

import { Clock3, Loader2, MapPinned, Phone, ReceiptText } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { Booking } from "../../types/booking"
import {
  formatBookingCreatedAt,
  formatBookingDate,
  formatCurrency,
} from "./booking-list.utils"
import { BookingStatusBadge } from "./booking-status-badge"

interface BookingListItemProps {
  booking: Booking
  onConfirmBooking: (booking: Booking) => void
  onCancelBooking: (booking: Booking) => void
  onOpenDetail: (booking: Booking) => void
  pendingAction: { bookingId: string; action: "confirm" | "cancel" } | null
}

function isPendingAction(
  pendingAction: BookingListItemProps["pendingAction"],
  bookingId: string,
  action: "confirm" | "cancel"
) {
  return (
    pendingAction?.bookingId === bookingId && pendingAction.action === action
  )
}

export function BookingListItem({
  booking,
  onConfirmBooking,
  onCancelBooking,
  onOpenDetail,
  pendingAction,
}: BookingListItemProps) {
  const phone = booking.phoneNumber || "—"
  const isBusy = Boolean(
    pendingAction && pendingAction.bookingId === booking.id
  )
  const showConfirmAction = booking.status === "PENDING"
  const showCancelAction =
    booking.status === "PENDING" || booking.status === "CONFIRMED"
  const firstBookingItem = booking.bookingItems?.[0]
  const courtName = firstBookingItem?.court?.name ?? "Sân"
  const timeRange = firstBookingItem
    ? `${firstBookingItem.startTime} - ${firstBookingItem.endTime}`
    : "—"

  return (
    <li className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <button
          type="button"
          onClick={() => onOpenDetail(booking)}
          className="min-w-0 flex-1 space-y-4 text-left"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg leading-6 font-semibold text-foreground">
                {booking.playerName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {courtName} · {formatBookingDate(booking.date)}
              </p>
              <p className="text-sm text-muted-foreground">
                Nhấn để xem thông tin đầy đủ
              </p>
            </div>

            <BookingStatusBadge status={booking.status} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
                <Phone className="size-3.5" />
                Số điện thoại
              </div>
              <div className="text-sm font-medium">{phone}</div>
            </div>

            <div className="rounded-xl border bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
                <Clock3 className="size-3.5" />
                Khung giờ
              </div>
              <div className="text-sm font-medium">{timeRange}</div>
            </div>

            <div className="rounded-xl border bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
                <MapPinned className="size-3.5" />
                Ngày tạo
              </div>
              <div className="text-sm font-medium">
                {formatBookingCreatedAt(booking.createdAt)}
              </div>
            </div>

            <div className="rounded-xl border bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
                <ReceiptText className="size-3.5" />
                Tổng tiền
              </div>
              <div className="text-sm font-medium">
                {formatCurrency(booking.totalPrice)}
              </div>
            </div>
          </div>
        </button>

        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          {showConfirmAction && (
            <Button
              onClick={(event) => {
                event.stopPropagation()
                onConfirmBooking(booking)
              }}
              disabled={isBusy}
              className="min-w-28"
            >
              {isPendingAction(pendingAction, booking.id, "confirm") && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Xác nhận
            </Button>
          )}

          {showCancelAction && (
            <Button
              onClick={(event) => {
                event.stopPropagation()
                onCancelBooking(booking)
              }}
              disabled={isBusy}
              variant="destructive"
              className="min-w-28"
            >
              {isPendingAction(pendingAction, booking.id, "cancel") && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Hủy đặt sân
            </Button>
          )}

          {!showConfirmAction && !showCancelAction && (
            <div className="text-sm text-muted-foreground">
              Trạng thái này không có thao tác quản lý.
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
