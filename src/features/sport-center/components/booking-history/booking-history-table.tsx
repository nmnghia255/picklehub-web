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
}

export function BookingHistoryTable({ bookings }: BookingHistoryTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="max-h-[68vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
            <TableRow>
              <TableHead>Trung tâm</TableHead>
              <TableHead>Ngày đặt</TableHead>
              {/* <TableHead>Khung giờ</TableHead> */}
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <BookingHistoryTableRow key={booking.id} booking={booking} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
