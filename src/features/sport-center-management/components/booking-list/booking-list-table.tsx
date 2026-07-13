"use client"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

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
  const { t } = useSportCenterManagementTranslation()
  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="max-h-[68vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
            <TableRow>
              <TableHead className="w-[20%]">
                {t("bookingList.table.customer")}
              </TableHead>
              <TableHead className="w-[14%]">
                {t("bookingList.table.phone")}
              </TableHead>
              <TableHead className="w-[12%]">
                {t("bookingList.table.bookingDate")}
              </TableHead>
              <TableHead className="w-[12%]">
                {t("bookingList.table.totalPrice")}
              </TableHead>
              <TableHead className="w-[18%]">
                {t("bookingList.table.createdAt")}
              </TableHead>
              <TableHead className="w-[14%]">
                {t("bookingList.table.status")}
              </TableHead>
              <TableHead className="w-14 px-2 text-center">
                {t("bookingList.table.actions")}
              </TableHead>
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
