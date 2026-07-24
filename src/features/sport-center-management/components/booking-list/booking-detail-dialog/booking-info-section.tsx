"use client"

import { TextSearch } from "lucide-react"

import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../../types/booking"
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
  const { t } = useSportCenterManagementTranslation()

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
        {t("bookingList.detail.infoTitle")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label={t("bookingList.detail.bookingCode")}
          value={booking.id}
        />
        <BookingDetailField
          label={t("bookingList.detail.startTime")}
          value={startTime}
        />
        {note && (
          <BookingDetailField
            label={t("bookingList.detail.note")}
            value={note}
          />
        )}
      </div>
    </section>
  )
}
