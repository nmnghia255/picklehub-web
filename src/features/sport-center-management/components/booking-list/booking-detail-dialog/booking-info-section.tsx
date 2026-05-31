"use client"

import { CalendarDays, Clock3 } from "lucide-react"

import type { Booking } from "../../../types/booking"
import { formatBookingDate } from "../booking-list.utils"
import { BookingDetailField } from "./booking-detail-field"

interface Props {
  booking: Booking
  courtName: string
  timeRange: string
}

export function BookingInfoSection({ booking, courtName, timeRange }: Props) {
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <CalendarDays className="size-4 text-emerald-500" />
        Thông tin đặt sân
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label="Mã đặt sân"
          value={booking.playSessionId ?? booking.id}
          icon={CalendarDays}
          toneClassName="text-emerald-500"
        />
        <BookingDetailField
          label="Tên sân"
          value={courtName}
          icon={CalendarDays}
          toneClassName="text-emerald-500"
        />
        <BookingDetailField
          label="Ngày đặt"
          value={formatBookingDate(booking.date)}
          icon={CalendarDays}
          toneClassName="text-emerald-500"
        />
        <BookingDetailField
          label="Khung giờ"
          value={timeRange}
          icon={Clock3}
          toneClassName="text-emerald-500"
        />
      </div>
    </section>
  )
}

export default BookingInfoSection
