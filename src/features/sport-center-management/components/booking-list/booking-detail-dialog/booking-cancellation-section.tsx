"use client"

import { ShieldCheck } from "lucide-react"

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
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck className="size-4 text-rose-500" />
        Thông tin hủy
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label="Ngày hủy"
          value={
            booking.cancelledAt
              ? formatBookingCreatedAt(booking.cancelledAt)
              : "—"
          }
          icon={ShieldCheck}
          toneClassName="text-rose-500"
        />
        <BookingDetailField
          label="Lý do hủy"
          value={booking.cancelReason ?? "—"}
          icon={ShieldCheck}
          toneClassName="text-rose-500"
        />
        <BookingDetailField
          label="Thanh toán proof"
          value={booking.paymentProofUrl ? "Có" : "Không"}
          icon={ShieldCheck}
          toneClassName="text-rose-500"
        />
        <BookingDetailField
          label="Đã upload proof"
          value={
            booking.paymentProofUploadedAt
              ? formatBookingCreatedAt(booking.paymentProofUploadedAt)
              : "—"
          }
          icon={ShieldCheck}
          toneClassName="text-rose-500"
        />
      </div>
      <div className="rounded-2xl border bg-muted/20 p-3">
        <p className="text-xs text-muted-foreground">Ghi chú</p>
        <p className="mt-1 text-sm leading-6 text-foreground">{displayNote}</p>
      </div>
    </section>
  )
}

export default BookingCancellationSection
