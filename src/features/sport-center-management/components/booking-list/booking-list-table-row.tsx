"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"
import { cn } from "@/lib/utils"

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
  const { t } = useSportCenterManagementTranslation()
  return (
    <TableRow
      className={cn(
        "group cursor-pointer transition-colors hover:bg-accent/50"
      )}
      onClick={() => onView(booking)}
    >
      <TableCell className="w-[28%]">
        <div className="space-y-1">
          <p className="truncate font-medium text-foreground">
            {booking.playerName}
          </p>
        </div>
      </TableCell>

      <TableCell className="w-[14%]">
        <div className="space-y-1">
          <p className="text-medium truncate text-foreground">
            {booking.phoneNumber || t("common.notUpdated")}
          </p>
        </div>
      </TableCell>

      <TableCell className="w-[12%]">
        <p className="text-medium text-foreground">
          {formatBookingDate(booking.date)}
        </p>
      </TableCell>

      <TableCell className="w-[12%]">
        {formatCurrency(booking.totalPrice)}
      </TableCell>

      <TableCell className="w-[18%]">
        {formatBookingCreatedAt(booking.createdAt)}
      </TableCell>

      <TableCell className="w-[14%] font-medium text-foreground">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>
      </TableCell>

      <TableCell
        className="w-14 px-2 text-center"
        onClick={(event) => event.stopPropagation()}
      >
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
