"use client"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { Booking } from "../../types/booking"
import { BookingListTableRow } from "./booking-list-table-row"

interface BookingListTableProps {
  bookings: Booking[]
  onView: (booking: Booking) => void
  onConfirmBooking: (booking: Booking) => void
  onCancelBooking: (booking: Booking) => void
}

export function BookingListTable({
  bookings,
  onView,
  onConfirmBooking,
  onCancelBooking,
}: BookingListTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="max-h-[68vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
            <TableRow>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Sân / khung giờ</TableHead>
              <TableHead>Ngày đặt</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <BookingListTableRow
                key={booking.id}
                booking={booking}
                onView={onView}
                onConfirmBooking={onConfirmBooking}
                onCancelBooking={onCancelBooking}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
