import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { BookingResponse } from "@/features/sport-center/types/booking"

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
  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="max-h-[68vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
            <TableRow>
              <TableHead className="w-[32%]">Trung tâm</TableHead>
              <TableHead className="w-[15%]">Ngày đặt</TableHead>
              <TableHead className="w-[12%]">Tổng tiền</TableHead>
              <TableHead className="w-[18%]">Ngày tạo</TableHead>
              <TableHead className="w-[13%]">Trạng thái</TableHead>
              <TableHead className="w-14 px-2 text-center">Thao tác</TableHead>
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
    </div>
  )
}
