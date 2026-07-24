"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../../types/booking"
import {
  formatBookingCreatedAt,
  formatBookingDate,
  formatCurrency,
  getBookingDisplayNote,
} from "../booking-list.utils"
import { BookingCancellationSection } from "./booking-cancellation-section"
import { BookingCustomerSection } from "./booking-customer-section"
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
  onActionSuccess: () => void
}

export function BookingDetailDialog({
  booking,
  onClose,
  onActionSuccess,
}: BookingDetailDialogProps) {
  const { t } = useSportCenterManagementTranslation()
  if (!booking) return null

  const displayNote = getBookingDisplayNote(booking)
  const firstBookingItem = booking.bookingItems?.[0]
  const startTime = firstBookingItem
    ? `${firstBookingItem.startTime}`
    : booking.items?.length > 0
      ? `${booking.items[0].startTime} - ${booking.items[0].endTime}`
      : t("common.notAvailable")
  const serviceCount = booking.bookingServices.length
  const productCount = booking.bookingProducts.length

  return (
    <Dialog open={Boolean(booking)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] w-[92vw] max-w-[92vw] overflow-y-auto p-0 sm:w-[80vw] sm:max-w-[80vw] lg:w-[60vw] lg:max-w-[60vw]">
        <div className="flex h-full flex-col bg-background">
          <BookingDetailHeader booking={booking} />

          <div className="space-y-6 px-6 py-5">
            <BookingSummaryCards booking={booking} />

            <Separator />

            <BookingCustomerSection booking={booking} variant="ghost" />

            <Separator />

            <BookingInfoSection
              booking={booking}
              note={displayNote}
              startTime={startTime}
              variant="ghost"
            />

            <Separator />

            <BookingPaymentSection booking={booking} variant="ghost" />

            <Separator />

            <BookingSummarySection
              booking={booking}
              serviceCount={serviceCount}
              productCount={productCount}
              variant="ghost"
            />

            {booking.status === "CANCELLED" && (
              <>
                <Separator />
                <BookingCancellationSection booking={booking} variant="ghost" />
              </>
            )}

            <Separator />

            <BookingScheduleServices booking={booking} variant="ghost" />

            <BookingFooterActions
              booking={booking}
              onClose={onClose}
              onActionSuccess={onActionSuccess}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
