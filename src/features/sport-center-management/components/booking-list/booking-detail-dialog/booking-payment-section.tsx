"use client"

import { CalendarDays, Coins } from "lucide-react"

import type { Booking } from "../../../types/booking"
import { formatBookingCreatedAt, formatCurrency } from "../booking-list.utils"
import { BookingDetailField } from "./booking-detail-field"

interface Props {
  booking: Booking
}

export function BookingPaymentSection({ booking }: Props) {
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Coins className="size-4 text-orange-500" />
        Thông tin thanh toán
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label="Tổng tiền"
          value={formatCurrency(booking.totalPrice)}
          icon={Coins}
          toneClassName="text-orange-500"
        />
        <BookingDetailField
          label="Số dư còn lại"
          value={formatCurrency(booking.paymentRemaining)}
          icon={Coins}
          toneClassName="text-orange-500"
        />
        <BookingDetailField
          label="Số dư đã áp dụng"
          value={formatCurrency(booking.creditApplied)}
          icon={Coins}
          toneClassName="text-orange-500"
        />
        <BookingDetailField
          label="Ngày tạo"
          value={formatBookingCreatedAt(booking.createdAt)}
          icon={CalendarDays}
          toneClassName="text-orange-500"
        />
        {booking.paymentProofUrl ? (
          <div className="rounded-2xl border bg-background/80 p-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Coins className="size-3.5 text-orange-500" />
              <span>Ảnh chứng từ</span>
            </div>
            <div className="mt-2">
              <a
                href={booking.paymentProofUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block"
              >
                <img
                  src={booking.paymentProofUrl}
                  alt="Payment proof"
                  className="max-h-40 w-auto rounded-md object-contain"
                />
              </a>
            </div>
          </div>
        ) : (
          <BookingDetailField
            label="Ảnh minh chứng"
            value="Chưa thanh toán"
            icon={Coins}
            toneClassName="text-orange-500"
          />
        )}
      </div>
    </section>
  )
}

export default BookingPaymentSection
