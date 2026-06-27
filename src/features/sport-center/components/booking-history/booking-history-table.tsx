import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { BookingResponse } from "@/features/sport-center/types/booking"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

import { BookingHistoryTableRow } from "./booking-history-table-row"

interface BookingHistoryTableProps {
  bookings: BookingResponse[]
  onView: (booking: BookingResponse) => void
  onCancel: (booking: BookingResponse) => void
}

export function BookingHistoryTable({
  bookings,
  onView,
  onCancel,
}: BookingHistoryTableProps) {
  const { t } = useSportCenterTranslation()
  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm **:data-[slot=table-container]:max-h-[68vh] **:data-[slot=table-container]:overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 z-10 h-12 [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-muted/50 [&_th]:backdrop-blur">
          <TableRow>
            <TableHead className="w-[32%]">
              {t("booking.history.center")}
            </TableHead>
            <TableHead className="w-[15%]">
              {t("booking.history.bookingDate")}
            </TableHead>
            <TableHead className="w-[12%]">
              {t("booking.history.totalMoney")}
            </TableHead>
            <TableHead className="w-[18%]">
              {t("booking.history.createdAtTitle")}
            </TableHead>
            <TableHead className="w-[13%]">
              {t("booking.history.statusTitle")}
            </TableHead>
            <TableHead className="w-14 px-2 text-center">
              {t("booking.history.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <BookingHistoryTableRow
              key={booking.id}
              booking={booking}
              onView={onView}
              onCancel={onCancel}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
