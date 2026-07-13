"use client"

import { Badge } from "@/components/ui/badge"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../../types/booking"
import { formatCurrency } from "../booking-list.utils"

interface Props {
  booking: Booking
}

export function BookingSummaryCards({ booking }: Props) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border bg-card/90 p-4 shadow-sm">
        <p className="text-xs text-muted-foreground">
          {t("bookingList.detail.customerTitle")}
        </p>
        <p className="mt-1 text-base font-semibold text-foreground">
          {booking.playerName}
        </p>
      </div>

      <div className="rounded-2xl border bg-card/90 p-4 shadow-sm">
        <p className="text-xs text-muted-foreground">
          {t("bookingList.detail.totalPrice")}
        </p>
        <p className="mt-1 text-base font-semibold text-foreground">
          {formatCurrency(booking.totalPrice)}
        </p>
      </div>
    </div>
  )
}

export default BookingSummaryCards
