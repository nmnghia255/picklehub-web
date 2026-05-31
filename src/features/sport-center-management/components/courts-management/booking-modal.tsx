"use client"

import { Clock, MapPin } from "lucide-react"
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

import type { Booking } from "../../types/booking"

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

  if (!booking) return null

  const getStatusLabel = () => {
    switch (booking.status) {
      case "CONFIRMED":
        return "Đã đặt"
      case "PENDING":
        return "Chờ xác nhận"
      case "CANCELLED":
        return "Đã hủy"
      case "COMPLETED":
        return "Hoàn thành"
      default:
        return booking.status
    }
  }

  const handleCancelConfirm = () => {
    onCancel(booking.id)
    setIsCancelConfirmOpen(false)
  }

  const getStatusColor = () => {
    switch (booking.status) {
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
      case "PENDING":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
      case "COMPLETED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <Dialog open={Boolean(booking)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chi tiết đặt sân</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              Tên người chơi
            </label>
            <p className="text-foreground">{booking.playerName}</p>
          </div>

          {/* <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              Liên hệ
            </label>
            <div className="flex items-center gap-2 text-foreground">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p>{booking.player?.name ?? booking.playerName ?? "—"}</p>
            </div>
          </div> */}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Thời gian
              </label>
              <div className="flex items-center gap-2 text-foreground">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                <p>{`${booking.startTime} - ${booking.endTime ?? ""}`}</p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Sân
              </label>
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                <p>{booking.court?.name ?? "—"}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              Trạng thái
            </label>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm ${getStatusColor()}`}
            >
              {getStatusLabel()}
            </span>
          </div>
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
