"use client"

import {
  Calendar,
  Clock3,
  Loader2,
  MapPinned,
  Phone,
  ReceiptText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../types/booking"
import {
  formatBookingCreatedAt,
  formatBookingDate,
  formatCurrency,
  getBookingDisplayNote,
} from "./booking-list.utils"
import { BookingStatusBadge } from "./booking-status-badge"

interface BookingCardProps {
  booking: Booking
  onConfirm: (booking: Booking) => void
  onCancel: (booking: Booking) => void
  isConfirming?: boolean
  isCancelling?: boolean
}

export function BookingCard({
  booking,
  onConfirm,
  onCancel,
  isConfirming = false,
  isCancelling = false,
}: BookingCardProps) {
  const { t } = useSportCenterManagementTranslation()
  const displayNote = getBookingDisplayNote(booking)
  const phone = booking.phoneNumber || t("common.notUpdated")
  const isBusy = isConfirming || isCancelling
  const showConfirmAction = booking.status === "PENDING"
  const showCancelAction =
    booking.status === "PENDING" || booking.status === "CONFIRMED"
  const firstBookingItem = booking.bookingItems?.[0]
  const courtName = firstBookingItem?.court?.name ?? t("bookingList.card.court")
  const timeRange = firstBookingItem
    ? `${firstBookingItem.startTime} - ${firstBookingItem.endTime}`
    : t("common.notAvailable")

  return (
    <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-6">
              {booking.playerName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {courtName} · {formatBookingDate(booking.date)}
            </p>
          </div>

          <BookingStatusBadge status={booking.status} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
              <Phone className="size-3.5" />
              {t("bookingList.card.phone")}
            </div>
            <div className="text-sm font-medium">{phone}</div>
          </div>

          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
              <Clock3 className="size-3.5" />
              {t("bookingList.card.timeRange")}
            </div>
            <div className="text-sm font-medium">{timeRange}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border bg-background/70 p-3">
            <MapPinned className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="space-y-1">
              <div className="text-xs tracking-wide text-muted-foreground uppercase">
                {t("bookingList.card.createdAt")}
              </div>
              <div className="text-sm font-medium">
                {formatBookingCreatedAt(booking.createdAt)}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border bg-background/70 p-3">
            <ReceiptText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="space-y-1">
              <div className="text-xs tracking-wide text-muted-foreground uppercase">
                {t("bookingList.card.totalPrice")}
              </div>
              <div className="text-sm font-medium">
                {formatCurrency(booking.totalPrice)}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
            <Calendar className="size-3.5" />
            {t("bookingList.card.note")}
          </div>
          <p className="text-sm leading-6 whitespace-pre-line text-foreground">
            {displayNote}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 border-t border-border/60 bg-muted/20 pt-4">
        {showConfirmAction && (
          <Button
            onClick={() => onConfirm(booking)}
            disabled={isBusy}
            className="min-w-28"
          >
            {isConfirming && <Loader2 className="size-4 animate-spin" />}
            {t("bookingList.card.confirm")}
          </Button>
        )}

        {showCancelAction && (
          <Button
            onClick={() => onCancel(booking)}
            disabled={isBusy}
            variant="destructive"
            className="min-w-28"
          >
            {isCancelling && <Loader2 className="size-4 animate-spin" />}
            {t("bookingList.card.cancelBooking")}
          </Button>
        )}

        {!showConfirmAction && !showCancelAction && (
          <div className="text-sm text-muted-foreground">
            {t("bookingList.card.noActions")}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
