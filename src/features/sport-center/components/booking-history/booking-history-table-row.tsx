import { TableCell, TableRow } from "@/components/ui/table"
import type { BookingResponse } from "@/features/sport-center/types/booking"
import {
  formatBookingCreatedAt,
  formatCurrency,
} from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import { BookingStatusBadge } from "@/features/sport-center-management/components/booking-list/booking-status-badge"
import { getDateOnly } from "@/utils/time-helper"

import {
  formatBookingCourtSummary,
  formatBookingTimeSummary,
  getBookingHistoryItems,
} from "../../../../app/(protected)/sport-center/booking-history/booking-history.utils"

interface BookingHistoryTableRowProps {
  booking: BookingResponse
}

export function BookingHistoryTableRow({
  booking,
}: BookingHistoryTableRowProps) {
  const items = getBookingHistoryItems(booking)

  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <div className="space-y-1">
          <p className="font-medium text-foreground">{booking.center.name}</p>
          <p className="text-sm text-muted-foreground">
            {booking.center.address}
          </p>
        </div>
      </TableCell>

      <TableCell className="whitespace-normal">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {getDateOnly(booking.date)}
          </p>
          <p className="text-sm text-muted-foreground">
            {items.length > 0
              ? `${items.length} khung giờ`
              : "Chưa có khung giờ"}
          </p>
        </div>
      </TableCell>
      {/* 
      <TableCell className="whitespace-normal">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {formatBookingTimeSummary(booking)}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatBookingCourtSummary(booking)}
          </p>
        </div>
      </TableCell> */}

      <TableCell>{formatCurrency(booking.totalPrice)}</TableCell>

      <TableCell>{formatBookingCreatedAt(booking.createdAt)}</TableCell>

      <TableCell className="font-medium text-foreground">
        <BookingStatusBadge status={booking.status} />
      </TableCell>
    </TableRow>
  )
}
