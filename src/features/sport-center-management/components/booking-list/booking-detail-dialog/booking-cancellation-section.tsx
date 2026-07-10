"use client"

import { Calendar, CreditCard, ShieldX } from "lucide-react"

import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../../types/booking"
import { formatBookingCreatedAt } from "../booking-list.utils"
import { BookingDetailField } from "./booking-detail-field"

interface Props {
  booking: Booking
  displayNote: string
}

export function BookingCancellationSection({ booking, displayNote }: Props) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
      <div className="text-md flex items-center gap-2 font-semibold">
        <ShieldX className="size-5 text-rose-500" />
        {t("bookingList.detail.cancellationTitle")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label={t("bookingList.detail.cancelledAt")}
          value={
            booking.cancelledAt
              ? formatBookingCreatedAt(booking.cancelledAt)
              : t("common.notUpdated")
          }
          icon={Calendar}
          toneClassName="text-rose-500"
        />
        <BookingDetailField
          label={t("bookingList.detail.cancelReason")}
          value={booking.cancelReason ?? t("common.noReason")}
          icon={ShieldX}
          toneClassName="text-rose-500"
        />
        <BookingDetailField
          label={t("bookingList.detail.payment")}
          value={booking.paymentProofUrl ? t("common.yes") : t("common.no")}
          icon={CreditCard}
          toneClassName="text-rose-500"
        />
        <BookingDetailField
          label={t("bookingList.detail.paymentProofUploadedAt")}
          value={
            booking.paymentProofUploadedAt
              ? formatBookingCreatedAt(booking.paymentProofUploadedAt)
              : t("common.notUpdated")
          }
          icon={Calendar}
          toneClassName="text-rose-500"
        />
      </div>
    </section>
  )
}

export default BookingCancellationSection
