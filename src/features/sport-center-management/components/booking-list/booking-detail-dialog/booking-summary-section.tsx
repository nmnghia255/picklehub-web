"use client"

import { ReceiptText } from "lucide-react"

import type { Booking } from "../../../types/booking"
import { formatCurrency } from "../booking-list.utils"
import { BookingDetailField } from "./booking-detail-field"

interface Props {
  booking: Booking
  serviceCount: number
  productCount: number
}

export function BookingSummarySection({
  booking,
  serviceCount,
  productCount,
}: Props) {
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ReceiptText className="size-4 text-violet-500" />
        Tổng hợp đặt sân
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <BookingDetailField
          label="Tổng tiền sân"
          value={formatCurrency(booking.totalCourtPrice)}
          icon={ReceiptText}
          toneClassName="text-violet-500"
        />
        <BookingDetailField
          label="Tổng tiền dịch vụ"
          value={formatCurrency(booking.totalServicePrice)}
          icon={ReceiptText}
          toneClassName="text-violet-500"
        />
        <BookingDetailField
          label="Tổng tiền sản phẩm"
          value={formatCurrency(booking.totalProductPrice)}
          icon={ReceiptText}
          toneClassName="text-violet-500"
        />
        <BookingDetailField
          label="Lượt sân"
          value={String(
            booking.bookingCount ?? booking.bookingItems?.length ?? 0
          )}
          icon={ReceiptText}
          toneClassName="text-violet-500"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label="Dịch vụ"
          value={String(serviceCount)}
          icon={ReceiptText}
          toneClassName="text-violet-500"
        />
        <BookingDetailField
          label="Sản phẩm"
          value={String(productCount)}
          icon={ReceiptText}
          toneClassName="text-violet-500"
        />
      </div>
    </section>
  )
}

export default BookingSummarySection
