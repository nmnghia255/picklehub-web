"use client"

import { CalendarDays, Clock3, MapPin, Phone, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import {
  formatCurrencyVnd,
  formatReservationDate,
  type ReservationRecord,
} from "../../../../app/(protected)/sport-center-management/reservation-management/mock-data"
import { ReservationActionsDropdown } from "./reservation-actions-dropdown"
import { ReservationStatusBadge } from "./reservation-status-badge"

interface ReservationCardMobileProps {
  reservation: ReservationRecord
  onView: (reservation: ReservationRecord) => void
  onOpen: (reservation: ReservationRecord) => void
  onConfirmBooking: (reservation: ReservationRecord) => void
  onExtendHold: (reservation: ReservationRecord) => void
  onMarkPaid: (reservation: ReservationRecord) => void
  onCancelReservation: (reservation: ReservationRecord) => void
}

function PaymentBadge({
  paymentStatus,
}: {
  paymentStatus: ReservationRecord["paymentStatus"]
}) {
  const styles: Record<ReservationRecord["paymentStatus"], string> = {
    PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-700",
    PAID: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
    FAILED: "border-rose-500/20 bg-rose-500/10 text-rose-700",
    REFUNDED: "border-slate-500/20 bg-slate-500/10 text-slate-600",
  }

  return (
    <Badge
      className={`border px-2.5 py-1 font-medium ${styles[paymentStatus]}`}
      variant="outline"
    >
      {paymentStatus.replace("_", " ")}
    </Badge>
  )
}

export function ReservationCardMobile({
  reservation,
  onView,
  onOpen,
  onConfirmBooking,
  onExtendHold,
  onMarkPaid,
  onCancelReservation,
}: ReservationCardMobileProps) {
  return (
    <Card
      className={`overflow-hidden border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${reservation.status === "HOLDING" || reservation.status === "AWAITING_PAYMENT" ? "ring-1 ring-blue-500/10" : ""}`}
      onClick={() => onOpen(reservation)}
    >
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {reservation.id}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserRound className="size-4" />
              {reservation.customerName}
            </div>
          </div>
          <ReservationStatusBadge status={reservation.status} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-muted/30 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              Reservation date
            </div>
            <p className="font-medium">
              {formatReservationDate(reservation.reservationDate)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {reservation.timeSlot}
            </p>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              Court
            </div>
            <p className="font-medium">{reservation.courtName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {reservation.source} source
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-muted/30 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="size-3.5" />
              Countdown
            </div>
            <p className="font-semibold text-foreground">
              {reservation.countdownText}
            </p>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="size-3.5" />
              Contact
            </div>
            <p className="font-semibold text-foreground">{reservation.phone}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PaymentBadge paymentStatus={reservation.paymentStatus} />
          <Badge variant="secondary">{reservation.source}</Badge>
          <Badge variant="outline">
            {formatCurrencyVnd(reservation.totalPrice)}
          </Badge>
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onView(reservation)}
          >
            View
          </Button>
          <ReservationActionsDropdown
            reservation={reservation}
            onView={onView}
            onConfirmBooking={onConfirmBooking}
            onExtendHold={onExtendHold}
            onMarkPaid={onMarkPaid}
            onCancelReservation={onCancelReservation}
          />
        </div>
      </CardContent>
    </Card>
  )
}
