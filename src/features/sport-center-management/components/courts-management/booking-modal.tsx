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

import { useCourtScheduleStore } from "../../stores/court-schedule-store"
import type { Booking } from "../../types/booking"
import { formatPhoneNumber, getStatusColor, getStatusLabel } from "../../utils"

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
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)

  const selectedSlot = useCourtScheduleStore((state) => state.selectedSlot)

  if (!selectedSlot || !booking) return null

  const handleCancelConfirm = () => {
    onCancel(booking.id)
    setIsCancelConfirmOpen(false)
  }

  return (
    <Dialog open={Boolean(booking)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chi tiết đặt sân</DialogTitle>
        </DialogHeader>

        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">
            <span className="text-emerald-900">{selectedSlot?.courtName}</span>{" "}
            lúc <span className="text-emerald-900">{selectedSlot?.time}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 space-y-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              Tên người chơi
            </label>
            <div className="flex items-center gap-2 text-foreground">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-foreground">{booking.playerName}</p>
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
              Liên hệ
            </label>
            <div className="flex items-center gap-2 text-foreground">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p>
                {formatPhoneNumber(booking.center.phone) ||
                  "Chưa có số điện thoại"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            Trạng thái
          </label>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm ${getStatusColor(booking)}`}
          >
            {getStatusLabel(booking)}
          </span>
        </div>

        {booking.status !== "CANCELLED" ? (
          <DialogFooter className="mt-6 sm:justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Đóng
            </Button>
            <Button
              onClick={() => setIsCancelConfirmOpen(true)}
              variant="destructive"
              className="flex-1 sm:flex-none"
            >
              Hủy đặt sân
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter className="mt-6 sm:justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Đóng
            </Button>
            <Button
              onClick={() => onBookNew(booking)}
              className="flex-1 sm:flex-none"
            >
              Đặt người chơi mới
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
            <AlertDialogTitle>Xác nhận hủy đặt sân</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy lượt đặt sân này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleCancelConfirm}
            >
              Hủy đặt sân
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
