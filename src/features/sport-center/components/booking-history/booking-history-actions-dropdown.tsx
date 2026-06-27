"use client"

import { CreditCard, MoreHorizontal, Search, XCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { BookingResponse } from "@/features/sport-center/types/booking"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

interface BookingHistoryActionsDropdownProps {
  booking: BookingResponse
  onView: (booking: BookingResponse) => void
  onCancel: (booking: BookingResponse) => void
}

export function BookingHistoryActionsDropdown({
  booking,
  onView,
  onCancel,
}: BookingHistoryActionsDropdownProps) {
  const { t } = useSportCenterTranslation()
  const canCancel =
    booking.status === "PENDING" || booking.status === "CONFIRMED"

  const showPay = booking.status === "PENDING" && !booking.paymentProofUrl

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => onView(booking)}>
          <Search className="mr-2 size-4" />
          {t("booking.history.viewDetail")}
        </DropdownMenuItem>

        {showPay && (
          <DropdownMenuItem asChild>
            <Link
              href={`/sport-center/${booking.center.id || booking.centerId}/booking/confirmation/payment?bookingId=${booking.id}`}
            >
              <CreditCard className="mr-2 size-4" />
              {t("booking.history.pay", { defaultValue: "Thanh toán" })}
            </Link>
          </DropdownMenuItem>
        )}

        {canCancel && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-rose-600 focus:text-rose-600"
              onClick={() => onCancel(booking)}
            >
              <XCircle className="mr-2 size-4" />
              {t("booking.history.cancelBooking")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default BookingHistoryActionsDropdown
