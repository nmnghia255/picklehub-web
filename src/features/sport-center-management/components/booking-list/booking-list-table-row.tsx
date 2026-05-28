"use client"

import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatDateTime, getDateOnly } from "@/utils/time-helper"

import type { Booking } from "../../types/booking"
import { BookingActionsDropdown } from "./booking-actions-dropdown"
import {
  formatBookingCreatedAt,
  formatBookingDate,
  formatCurrency,
  getBookingDisplayNote,
} from "./booking-list.utils"
import { BookingStatusBadge } from "./booking-status-badge"

interface BookingListTableRowProps {
  booking: Booking
  onView: (booking: Booking) => void
  onConfirmBooking: (booking: Booking) => void
  onCancelBooking: (booking: Booking) => void
}

export function BookingListTableRow({
  booking,
  onView,
  onConfirmBooking,
  onCancelBooking,
}: BookingListTableRowProps) {
  return (
    <TableRow
      className={cn(
        "group cursor-pointer transition-colors hover:bg-accent/50"
      )}
      onClick={() => onView(booking)}
    >
      <TableCell>
        <div className="space-y-1">
          <p className="font-medium text-foreground">{booking.playerName}</p>
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-1">
          <p className="text-medium text-foreground">
            {booking.phoneNumber || "Chưa cập nhật"}
          </p>
        </div>
      </TableCell>

      <TableCell>
        <p className="text-medium text-foreground">
          {getDateOnly(booking.date)}
        </p>
      </TableCell>

      <TableCell>{formatCurrency(booking.totalPrice)}</TableCell>

      <TableCell>{formatBookingCreatedAt(booking.createdAt)}</TableCell>

      <TableCell className="font-medium text-foreground">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>
      </TableCell>

      <TableCell onClick={(event) => event.stopPropagation()}>
        <BookingActionsDropdown
          booking={booking}
          onView={onView}
          onConfirm={onConfirmBooking}
          onCancel={onCancelBooking}
        />
      </TableCell>
    </TableRow>
  )
}
