"use client"

import {
  CalendarDays,
  Clock3,
  Coins,
  History,
  MapPinned,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

import type { Booking } from "../../../types/booking"
import {
  formatBookingCreatedAt,
  formatBookingDate,
  formatCurrency,
  getBookingDisplayNote,
} from "../booking-list.utils"
import { BookingStatusBadge } from "../booking-status-badge"
import { BookingCancellationSection } from "./booking-cancellation-section"
import { BookingCustomerSection } from "./booking-customer-section"
import { BookingDetailField } from "./booking-detail-field"
import { BookingDetailHeader } from "./booking-detail-header"
import { BookingFooterActions } from "./booking-footer-actions"
import { BookingInfoSection } from "./booking-info-section"
import { BookingPaymentSection } from "./booking-payment-section"
import { BookingScheduleServices } from "./booking-schedule-services"
import { BookingSummaryCards } from "./booking-summary-cards"
import { BookingSummarySection } from "./booking-summary-section"

interface BookingDetailDialogProps {
  booking: Booking | null
  onClose: () => void
}

export function BookingDetailDialog({
  booking,
  onClose,
}: BookingDetailDialogProps) {
  if (!booking) return null

  const displayNote = getBookingDisplayNote(booking)
  const firstBookingItem = booking.bookingItems?.[0]
  const courtName = firstBookingItem?.court?.name ?? "Sân"
  const timeRange = firstBookingItem
    ? `${firstBookingItem.startTime} - ${firstBookingItem.endTime}`
    : "—"
  const serviceCount = booking.bookingServices.length
  const productCount = booking.bookingProducts.length

  return (
    <Dialog open={Boolean(booking)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] w-[96vw]! max-w-[96vw]! overflow-y-auto p-0 sm:w-[88vw]! sm:max-w-[88vw]! lg:w-[75vw]! lg:max-w-[75vw]!">
        <div className="flex h-full flex-col bg-background">
          <BookingDetailHeader booking={booking} />

          <div className="space-y-6 px-6 py-5">
            <BookingSummaryCards booking={booking} />

            <BookingCustomerSection booking={booking} />

            <BookingInfoSection
              booking={booking}
              courtName={courtName}
              timeRange={timeRange}
            />

            <BookingPaymentSection booking={booking} />

            <BookingSummarySection
              booking={booking}
              serviceCount={serviceCount}
              productCount={productCount}
            />

            <BookingCancellationSection
              booking={booking}
              displayNote={displayNote}
            />

            <BookingScheduleServices booking={booking} />

            <BookingFooterActions onClose={onClose} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
