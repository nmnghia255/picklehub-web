"use client"

import {
  BadgeCheck,
  Eye,
  MoreHorizontal,
  TimerReset,
  Wallet,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { ReservationRecord } from "../../../../app/(protected)/sport-center-management/reservation-management/mock-data"

interface ReservationActionsDropdownProps {
  reservation: ReservationRecord
  onView: (reservation: ReservationRecord) => void
  onConfirmBooking: (reservation: ReservationRecord) => void
  onExtendHold: (reservation: ReservationRecord) => void
  onMarkPaid: (reservation: ReservationRecord) => void
  onCancelReservation: (reservation: ReservationRecord) => void
}

export function ReservationActionsDropdown({
  reservation,
  onView,
  onConfirmBooking,
  onExtendHold,
  onMarkPaid,
  onCancelReservation,
}: ReservationActionsDropdownProps) {
  const isFinal =
    reservation.status === "CONFIRMED" ||
    reservation.status === "EXPIRED" ||
    reservation.status === "CANCELLED"

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
        <DropdownMenuItem onClick={() => onView(reservation)}>
          <Eye className="mr-2 size-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isFinal}
          onClick={() => onConfirmBooking(reservation)}
        >
          <BadgeCheck className="mr-2 size-4" />
          Confirm Booking
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isFinal}
          onClick={() => onExtendHold(reservation)}
        >
          <TimerReset className="mr-2 size-4" />
          Extend Hold
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={reservation.paymentStatus === "PAID" || isFinal}
          onClick={() => onMarkPaid(reservation)}
        >
          <Wallet className="mr-2 size-4" />
          Mark Paid
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-rose-600 focus:text-rose-600"
          disabled={reservation.status === "CANCELLED"}
          onClick={() => onCancelReservation(reservation)}
        >
          <XCircle className="mr-2 size-4" />
          Cancel Reservation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
