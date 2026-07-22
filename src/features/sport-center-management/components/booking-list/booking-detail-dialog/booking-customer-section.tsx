"use client"

import { UserRound } from "lucide-react"

import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../../types/booking"
import { BookingDetailField } from "./booking-detail-field"

interface Props {
  booking: Booking
  variant?: "card" | "ghost"
}

export function BookingCustomerSection({ booking, variant = "card" }: Props) {
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
        <UserRound className="size-5 text-sky-500" />
        {t("bookingList.detail.customerTitle")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label={t("bookingList.detail.customerName")}
          value={booking.playerName || t("common.notAvailable")}
        />
        <BookingDetailField
          label={t("bookingList.detail.customerPhone")}
          value={booking.phoneNumber || t("common.notAvailable")}
        />
      </div>
    </section>
  )
}
