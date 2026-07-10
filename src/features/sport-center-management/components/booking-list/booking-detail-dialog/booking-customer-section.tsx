"use client"

import { Phone, UserRound } from "lucide-react"

import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../../types/booking"
import { BookingDetailField } from "./booking-detail-field"

interface Props {
  booking: Booking
}

export function BookingCustomerSection({ booking }: Props) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
      <div className="text-md flex items-center gap-2 font-semibold">
        <UserRound className="size-5 text-sky-500" />
        {t("bookingList.detail.customerTitle")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label={t("bookingList.detail.customerName")}
          value={booking.playerName}
          icon={UserRound}
          toneClassName="text-sky-500"
        />
        <BookingDetailField
          label={t("bookingList.detail.customerPhone")}
          value={booking.phoneNumber || t("common.notUpdated")}
          icon={Phone}
          toneClassName="text-sky-500"
        />
      </div>
    </section>
  )
}

export default BookingCustomerSection
