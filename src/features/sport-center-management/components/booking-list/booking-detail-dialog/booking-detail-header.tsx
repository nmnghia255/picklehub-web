"use client"

import { Badge } from "@/components/ui/badge"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../../types/booking"
import { BookingStatusBadge } from "../booking-status-badge"

interface Props {
  booking: Booking
}

export function BookingDetailHeader({ booking }: Props) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <DialogHeader className="border-b bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_32%),linear-gradient(to_bottom,rgba(2,6,23,0.02),transparent)] px-6 py-5 text-left sm:text-left">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <DialogTitle className="text-2xl font-bold">
            {t("bookingList.detail.title")}
          </DialogTitle>
          <DialogDescription>
            {t("bookingList.detail.description")}
          </DialogDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-sky-200 bg-sky-50 text-sky-700"
          >
            {booking.playSessionId ?? booking.id}
          </Badge>
          <BookingStatusBadge status={booking.status} />
        </div>
      </div>
    </DialogHeader>
  )
}

export default BookingDetailHeader
