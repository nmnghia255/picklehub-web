"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cancelBookingAction } from "@/features/sport-center/actions/cancel-booking-action"
import type { BookingResponse } from "@/features/sport-center/types/booking"
import { BookingCancellationSection } from "@/features/sport-center-management/components/booking-list/booking-detail-dialog/booking-cancellation-section"
import { BookingCustomerSection } from "@/features/sport-center-management/components/booking-list/booking-detail-dialog/booking-customer-section"
import { BookingDetailHeader } from "@/features/sport-center-management/components/booking-list/booking-detail-dialog/booking-detail-header"
import { BookingInfoSection } from "@/features/sport-center-management/components/booking-list/booking-detail-dialog/booking-info-section"
import { BookingPaymentSection } from "@/features/sport-center-management/components/booking-list/booking-detail-dialog/booking-payment-section"
import { BookingScheduleServices } from "@/features/sport-center-management/components/booking-list/booking-detail-dialog/booking-schedule-services"
import { BookingSummaryCards } from "@/features/sport-center-management/components/booking-list/booking-detail-dialog/booking-summary-cards"
import { BookingSummarySection } from "@/features/sport-center-management/components/booking-list/booking-detail-dialog/booking-summary-section"
import { getBookingDisplayNote } from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import CancelReasonDialog from "@/features/sport-center-management/components/booking-list/cancel-reason-dialog"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

interface BookingHistoryDetailDialogProps {
  booking: BookingResponse | null
  onClose: () => void
  onActionSuccess?: () => void
}

export function BookingHistoryDetailDialog({
  booking,
  onClose,
  onActionSuccess,
}: BookingHistoryDetailDialogProps) {
  const { t } = useSportCenterTranslation()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  if (!booking) return null

  const displayNote = getBookingDisplayNote(booking)
  const firstBookingItem = booking.bookingItems?.[0]
  const startTime = firstBookingItem
    ? `${firstBookingItem.startTime}`
    : booking.items.length > 0
      ? `${booking.items[0].startTime} - ${booking.items[0].endTime}`
      : "—"
  const serviceCount = booking.bookingServices.length
  const productCount = booking.bookingProducts.length
  const canCancel =
    booking.status === "PENDING" || booking.status === "CONFIRMED"

  const handleCancelBooking = async (reason: string) => {
    setIsCancelling(true)
    setCancelError(null)

    try {
      await cancelBookingAction(booking.id, reason)
      setShowCancelDialog(false)
      onActionSuccess?.()
      onClose()
    } catch (error) {
      setCancelError(
        error instanceof Error
          ? error.message
          : t("booking.history.cancelErrorDesc")
      )
      throw error
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <>
      <Dialog
        open={Boolean(booking)}
        onOpenChange={(open) => !open && onClose()}
      >
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
                  <BookingCancellationSection
                    booking={booking}
                    variant="ghost"
                  />
                </>
              )}

              <Separator />

              <BookingScheduleServices booking={booking} variant="ghost" />

              {cancelError ? (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {cancelError}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={onClose}>
                  {t("booking.history.close")}
                </Button>

                {canCancel ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isCancelling}
                  >
                    {t("booking.history.cancelBooking")}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CancelReasonDialog
        open={showCancelDialog}
        onOpenChange={(open) => !open && setShowCancelDialog(false)}
        title={t("booking.history.cancelBookingTitle")}
        description={t("booking.history.cancelReasonDesc")}
        submitLabel={t("booking.history.confirmCancel")}
        onSubmit={handleCancelBooking}
      />
    </>
  )
}

export default BookingHistoryDetailDialog
