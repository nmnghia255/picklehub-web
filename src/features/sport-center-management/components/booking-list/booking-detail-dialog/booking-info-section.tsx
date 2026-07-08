"use client"

import {
  CalendarDays,
  Clock3,
  Columns3,
  NotepadText,
  TextSearch,
} from "lucide-react"

import type { Booking } from "../../../types/booking"
import { formatBookingDate } from "../booking-list.utils"
import { BookingDetailField } from "./booking-detail-field"

interface Props {
  booking: Booking
  note: string
  startTime: string
  variant?: "card" | "ghost"
}

export function BookingInfoSection({
  booking,
  note,
  startTime,
  variant = "card",
}: Props) {
  return (
    <section
      className={
        variant === "ghost"
          ? "space-y-4"
          : "space-y-4 rounded-3xl border bg-card p-4 shadow-sm"
      }
    >
      <div className="text-md flex items-center gap-2 font-semibold">
        <TextSearch className="size-5 text-emerald-500" />
        Thông tin đặt sân
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label="Mã đặt sân"
          value={booking.playSessionId ?? booking.id}
          icon={Columns3}
          toneClassName="text-emerald-500"
        />
        <BookingDetailField
          label="Giờ bắt đầu"
          value={startTime}
          icon={Clock3}
          toneClassName="text-emerald-500"
        />
        <BookingDetailField
          label="Ngày đặt"
          value={formatBookingDate(booking.date)}
          icon={CalendarDays}
          toneClassName="text-emerald-500"
        />
        <BookingDetailField
          label="Ghi chú"
          value={note}
          icon={NotepadText}
          toneClassName="text-emerald-500"
        />
      </div>
    </section>
  )
}

export default BookingInfoSection
