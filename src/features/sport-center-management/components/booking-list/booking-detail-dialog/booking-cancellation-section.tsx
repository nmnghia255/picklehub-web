"use client"

import { Calendar, CreditCard, ShieldX } from "lucide-react"

import type { Booking } from "../../../types/booking"
import { formatBookingCreatedAt } from "../booking-list.utils"
import { BookingDetailField } from "./booking-detail-field"

interface Props {
  booking: Booking
  displayNote: string
}

export function BookingCancellationSection({ booking, displayNote }: Props) {
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
      <div className="text-md flex items-center gap-2 font-semibold">
        <ShieldX className="size-5 text-rose-500" />
        Thông tin hủy
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label="Ngày hủy"
          value={
            booking.cancelledAt
              ? formatBookingCreatedAt(booking.cancelledAt)
              : "Chưa cập nhật"
          }
          icon={Calendar}
          toneClassName="text-rose-500"
        />
        <BookingDetailField
          label="Lý do hủy"
          value={booking.cancelReason ?? "Không có lý do"}
          icon={ShieldX}
          toneClassName="text-rose-500"
        />
        <BookingDetailField
          label="Thanh toán"
          value={booking.paymentProofUrl ? "Có" : "Không"}
          icon={CreditCard}
          toneClassName="text-rose-500"
        />
        <BookingDetailField
          label="Ngày tải lên minh chứng thanh toán"
          value={
            booking.paymentProofUploadedAt
              ? formatBookingCreatedAt(booking.paymentProofUploadedAt)
              : "Chưa cập nhật"
          }
          icon={Calendar}
          toneClassName="text-rose-500"
        />
      </div>
    </section>
  )
}

export default BookingCancellationSection
