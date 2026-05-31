"use client"

import { CheckCircle2, MoreHorizontal, Search, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { Booking } from "../../types/booking"

interface BookingActionsDropdownProps {
  booking: Booking
  onView: (booking: Booking) => void
  onConfirm: (booking: Booking) => void
  onCancel: (booking: Booking) => void
}

export function BookingActionsDropdown({
  booking,
  onView,
  onConfirm,
  onCancel,
}: BookingActionsDropdownProps) {
  const showConfirmAction = booking.status === "PENDING"
  const showCancelAction =
    booking.status === "PENDING" || booking.status === "CONFIRMED"

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
          Xem chi tiết
        </DropdownMenuItem>
        {(showConfirmAction || showCancelAction) && <DropdownMenuSeparator />}
        {showConfirmAction && (
          <DropdownMenuItem onClick={() => onConfirm(booking)}>
            <CheckCircle2 className="mr-2 size-4" />
            Xác nhận
          </DropdownMenuItem>
        )}
        {showCancelAction && (
          <DropdownMenuItem
            className="text-rose-600 focus:text-rose-600"
            onClick={() => onCancel(booking)}
          >
            <XCircle className="mr-2 size-4" />
            Hủy đặt sân
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
