"use client"

import { DollarSign, ReceiptText } from "lucide-react"

import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

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
  const { t } = useSportCenterManagementTranslation()
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
      <div className="text-md flex items-center gap-2 font-semibold">
        <ReceiptText className="size-5 text-violet-500" />
        {t("bookingList.detail.summaryTitle")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <BookingDetailField
          label={t("bookingList.detail.totalCourtPrice")}
          value={formatCurrency(booking.totalCourtPrice)}
          icon={DollarSign}
          toneClassName="text-violet-500"
        />
        <BookingDetailField
          label={t("bookingList.detail.totalServicePrice")}
          value={formatCurrency(booking.totalServicePrice)}
          icon={DollarSign}
          toneClassName="text-violet-500"
        />
        <BookingDetailField
          label={t("bookingList.detail.totalProductPrice")}
          value={formatCurrency(booking.totalProductPrice)}
          icon={DollarSign}
          toneClassName="text-violet-500"
        />
        <BookingDetailField
          label={t("bookingList.detail.totalTimeSlots")}
          value={String(
            booking.bookingCount ?? booking.bookingItems?.length ?? 0
          )}
          icon={ReceiptText}
          toneClassName="text-violet-500"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label={t("bookingList.detail.services")}
          value={String(serviceCount)}
          icon={ReceiptText}
          toneClassName="text-violet-500"
        />
        <BookingDetailField
          label={t("bookingList.detail.products")}
          value={String(productCount)}
          icon={ReceiptText}
          toneClassName="text-violet-500"
        />
      </div>
    </section>
  )
}

export default BookingSummarySection
