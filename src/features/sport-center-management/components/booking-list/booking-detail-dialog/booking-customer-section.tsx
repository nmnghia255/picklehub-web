"use client"

import { UserRound } from "lucide-react"

import type { Booking } from "../../../types/booking"
import { BookingDetailField } from "./booking-detail-field"

interface Props {
  booking: Booking
}

export function BookingCustomerSection({ booking }: Props) {
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
      <div className="text-md flex items-center gap-2 font-semibold">
        <UserRound className="size-5 text-sky-500" />
        Thông tin khách hàng
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label="Tên"
          value={booking.playerName}
          icon={UserRound}
          toneClassName="text-sky-500"
        />
        <BookingDetailField
          label="Số điện thoại"
          value={booking.phoneNumber || "Chưa cập nhật"}
          icon={UserRound}
          toneClassName="text-sky-500"
        />
      </div>
    </section>
  )
}

export default BookingCustomerSection
