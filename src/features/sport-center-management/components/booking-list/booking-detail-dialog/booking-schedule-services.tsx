"use client"

import { ReceiptText } from "lucide-react"

import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../../types/booking"
import { BookingDetailField } from "./booking-detail-field"

interface Props {
  booking: Booking
  variant?: "card" | "ghost"
}

export function BookingScheduleServices({ booking, variant = "card" }: Props) {
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
        <ReceiptText className="size-5 text-slate-500" />
        {t("bookingList.detail.scheduleTitle")}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <BookingDetailField
          label={t("bookingList.detail.courtBookings")}
          value={String(booking.bookingItems.length)}
        />
        <BookingDetailField
          label={t("bookingList.detail.totalPrice")}
          value={formatBookingTotal(booking.totalPrice)}
        />
      </div>
    </section>
  )
}

function formatBookingTotal(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}
