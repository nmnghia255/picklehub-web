"use client"

import { Phone, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useCourtScheduleStore } from "../../stores/court-schedule-store"

interface QuickBookingModalProps {
  onClose: () => void
  onCreate: (playerName: string, phone: string, note: string) => Promise<void>
}

export function QuickBookingModal({
  onClose,
  onCreate,
}: QuickBookingModalProps) {
  const quickBookingSlot = useCourtScheduleStore(
    (state) => state.quickBookingSlot
  )
  const quickBookingPlayerName = useCourtScheduleStore(
    (state) => state.quickBookingPlayerName
  )
  const quickBookingPhone = useCourtScheduleStore(
    (state) => state.quickBookingPhone
  )
  const quickBookingNote = useCourtScheduleStore(
    (state) => state.quickBookingNote
  )
  const setQuickBookingPlayerName = useCourtScheduleStore(
    (state) => state.setQuickBookingPlayerName
  )
  const setQuickBookingPhone = useCourtScheduleStore(
    (state) => state.setQuickBookingPhone
  )
  const setQuickBookingNote = useCourtScheduleStore(
    (state) => state.setQuickBookingNote
  )
  const closeQuickBooking = useCourtScheduleStore(
    (state) => state.closeQuickBooking
  )

  if (!quickBookingSlot) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      quickBookingPlayerName.trim() &&
      quickBookingPhone.trim() &&
      quickBookingNote.trim()
    ) {
      try {
        await onCreate(
          quickBookingPlayerName,
          quickBookingPhone,
          quickBookingNote
        )
        closeQuickBooking()
      } catch (error) {
        console.error("Create Booking error:", error)
      }
    }
  }

  const handleClose = () => {
    closeQuickBooking()
    onClose()
  }

  return (
    <Dialog
      open={Boolean(quickBookingSlot)}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đặt sân nhanh</DialogTitle>
        </DialogHeader>

        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">
            <span className="text-emerald-900">
              {quickBookingSlot.courtName}
            </span>{" "}
            lúc{" "}
            <span className="text-emerald-900">{quickBookingSlot.time}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Player Name */}
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Tên người chơi
            </label>
            <div className="relative">
              <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={quickBookingPlayerName}
                onChange={(e) => setQuickBookingPlayerName(e.target.value)}
                placeholder="Nhập tên người chơi"
                className="bg-input-background w-full rounded-lg border border-border py-2 pr-4 pl-10 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>
          {/* Phone number */}
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Số điện thoại
            </label>
            <div className="relative">
              <Phone className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={quickBookingPhone}
                onChange={(e) => setQuickBookingPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="bg-input-background w-full rounded-lg border border-border py-2 pr-4 pl-10 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Ghi chú
            </label>
            <div className="relative">
              <textarea
                value={quickBookingNote}
                onChange={(e) => setQuickBookingNote(e.target.value)}
                placeholder="Nhập ghi chú cho lượt đặt sân"
                rows={3}
                className="bg-input-background w-full rounded-lg border border-border px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-2 sm:justify-end">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-linear-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 sm:flex-none"
            >
              Xác nhận đặt sân
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
