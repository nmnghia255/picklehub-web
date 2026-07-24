"use client"

import { Clock, Phone, User } from "lucide-react"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { useCourtScheduleStore } from "../../stores/court-schedule-store"
import type { Booking } from "../../types/booking"
import { formatPhoneNumber, getStatusColor, getStatusLabel } from "../../utils"
import { getBookingDisplayNote } from "../booking-list/booking-list.utils"

interface BookingDetailModalProps {
  booking: Booking | null
  onClose: () => void
  onCancel: (bookingId: string) => void
  onBookNew: (booking: Booking) => void
}

export function BookingDetailModal({
  booking,
  onClose,
  onCancel,
  onBookNew,
}: BookingDetailModalProps) {
  const { t } = useSportCenterManagementTranslation()
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)

  const selectedSlot = useCourtScheduleStore((state) => state.selectedSlot)

  if (!selectedSlot || !booking) return null

  const handleCancelConfirm = () => {
    onCancel(booking.id)
    setIsCancelConfirmOpen(false)
  }

  return (
    <Dialog open={Boolean(booking)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="ap-0 max-w-md">
        <DialogHeader>
          <DialogTitle>{t("courts.detail.title")}</DialogTitle>
        </DialogHeader>

        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">
            <span className="text-emerald-900">{selectedSlot?.courtName}</span>{" "}
            {t("courts.detail.timeAt")}{" "}
            <span className="text-emerald-900">{selectedSlot?.time}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 space-y-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              {t("courts.detail.playerName")}
            </label>
            <div className="flex items-center gap-2 text-foreground">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-foreground">{booking.playerName}</p>
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
              {t("courts.detail.contact")}
            </label>
            <div className="flex items-center gap-2 text-foreground">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p>
                {formatPhoneNumber(booking.center.phone) ||
                  t("courts.detail.noPhone")}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            {t("courts.detail.status")}
          </label>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm ${getStatusColor(booking)}`}
          >
            {getStatusLabel(booking)}
          </span>
        </div>

        {booking.note ? (
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              {t("courts.quickBooking.note")}
            </label>
            <p className="text-sm text-foreground">
              {getBookingDisplayNote(booking) || booking.note}
            </p>
          </div>
        ) : null}

        {booking.status !== "CANCELLED" ? (
          <DialogFooter className="sm:justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              {t("common.close")}
            </Button>
            <Button
              onClick={() => setIsCancelConfirmOpen(true)}
              variant="destructive"
              className="flex-1 sm:flex-none"
            >
              {t("bookingList.card.cancelBooking")}
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter className="sm:justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              {t("common.close")}
            </Button>
            <Button
              onClick={() => onBookNew(booking)}
              className="flex-1 sm:flex-none"
            >
              {t("courts.detail.rebook")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>

      <AlertDialog
        open={isCancelConfirmOpen}
        onOpenChange={setIsCancelConfirmOpen}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("courts.detail.cancelConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("courts.detail.cancelConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.no")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleCancelConfirm}
            >
              {t("bookingList.card.cancelBooking")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
