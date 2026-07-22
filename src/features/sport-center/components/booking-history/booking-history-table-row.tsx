import { TableCell, TableRow } from "@/components/ui/table"
import type { BookingResponse } from "@/features/sport-center/types/booking"
import {
  formatBookingCreatedAt,
  formatBookingDate,
  formatCurrency,
} from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import { BookingStatusBadge } from "@/features/sport-center-management/components/booking-list/booking-status-badge"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"
import { cn } from "@/lib/utils"

import { getBookingHistoryItems } from "./booking-history.utils"
import { BookingHistoryActionsDropdown } from "./booking-history-actions-dropdown"

interface BookingHistoryTableRowProps {
  booking: BookingResponse
  onView: (booking: BookingResponse) => void
  onCancel: (booking: BookingResponse) => void
}

export function BookingHistoryTableRow({
  booking,
  onView,
  onCancel,
}: BookingHistoryTableRowProps) {
  const { t } = useSportCenterTranslation()
  const items = getBookingHistoryItems(booking)

  return (
    <TableRow
      className={cn(
        "group cursor-pointer transition-colors hover:bg-accent/50"
      )}
      onClick={() => onView(booking)}
    >
      <TableCell className="w-[32%] whitespace-normal">
        <div className="space-y-1">
          <p className="truncate font-medium text-foreground">
            {booking.center.name}
          </p>
          <p className="text-sm leading-5 wrap-break-word text-muted-foreground">
            {booking.center.address}
          </p>
        </div>
      </TableCell>

      <TableCell className="w-[15%] whitespace-normal">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {formatBookingDate(booking.date)}
          </p>
          <p className="text-sm text-muted-foreground">
            {items.length > 0
              ? t("booking.history.slotsCount", { count: items.length })
              : t("booking.history.noSlots")}
          </p>
        </div>
      </TableCell>

      <TableCell className="w-[12%]">
        {formatCurrency(booking.totalPrice)}
      </TableCell>

      <TableCell className="w-[18%]">
        {formatBookingCreatedAt(booking.createdAt)}
      </TableCell>

      <TableCell className="w-[13%] font-medium text-foreground">
        <BookingStatusBadge status={booking.status} />
      </TableCell>

      <TableCell
        className="w-14 px-2 text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <BookingHistoryActionsDropdown
          booking={booking}
          onView={onView}
          onCancel={onCancel}
        />
      </TableCell>
    </TableRow>
  )
}
