"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  cancelBookingAction,
  confirmBookingAction,
} from "@/features/sport-center-management/actions/booking-actions"
import CancelReasonDialog from "@/features/sport-center-management/components/booking-list/cancel-reason-dialog"

import type { Booking } from "../../../types/booking"

interface Props {
  booking: Booking
  onClose: () => void
  onActionSuccess: () => void
}

export function BookingFooterActions({
  booking,
  onClose,
  onActionSuccess,
}: Props) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      await confirmBookingAction(booking.id)
      onActionSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm booking")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = async (reason?: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      await cancelBookingAction(booking.id, reason)
      onActionSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOpenCancel = () => setShowCancelDialog(true)

  return (
    <div>
      {error ? <div className="mb-2 text-sm text-rose-500">{error}</div> : null}

      <div className="flex justify-end gap-2 border-t pt-2">
        {booking.status === "PENDING" && (
          <Button onClick={handleConfirm} disabled={isProcessing}>
            Xác nhận
          </Button>
        )}

        {booking.status !== "CANCELLED" && (
          <Button
            onClick={handleOpenCancel}
            variant="destructive"
            disabled={isProcessing}
          >
            Hủy
          </Button>
        )}

        <Button onClick={onClose} variant="outline">
          Đóng
        </Button>
      </div>

      <CancelReasonDialog
        open={showCancelDialog}
        onOpenChange={(open) => !open && setShowCancelDialog(false)}
        onSubmit={handleCancel}
      />
    </div>
  )
}

export default BookingFooterActions
