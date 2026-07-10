"use client"

import {
  CalendarDays,
  Clock3,
  Columns3,
  NotepadText,
  TextSearch,
} from "lucide-react"

import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../../types/booking"
import { formatBookingDate } from "../booking-list.utils"
import { BookingDetailField } from "./booking-detail-field"

interface Props {
  booking: Booking
  note: string
  startTime: string
}

export function BookingInfoSection({ booking, note, startTime }: Props) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
      <div className="text-md flex items-center gap-2 font-semibold">
        <TextSearch className="size-5 text-emerald-500" />
        {t("bookingList.detail.infoTitle")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BookingDetailField
          label={t("bookingList.detail.bookingCode")}
          value={booking.playSessionId ?? booking.id}
          icon={Columns3}
          toneClassName="text-emerald-500"
        />
        <BookingDetailField
          label={t("bookingList.detail.startTime")}
          value={startTime}
          icon={Clock3}
          toneClassName="text-emerald-500"
        />
        <BookingDetailField
          label={t("bookingList.detail.bookingDate")}
          value={formatBookingDate(booking.date)}
          icon={CalendarDays}
          toneClassName="text-emerald-500"
        />
        <BookingDetailField
          label={t("bookingList.detail.note")}
          value={note || t("common.noNote")}
          icon={NotepadText}
          toneClassName="text-emerald-500"
        />
      </div>
    </section>
  )
}

export default BookingInfoSection
