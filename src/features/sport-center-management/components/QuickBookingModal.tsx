"use client"

import { User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useCourtScheduleStore } from "../stores/court-schedule-store"

interface QuickBookingModalProps {
  onClose: () => void
  onCreate: (playerName: string, note: string) => void
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
  const quickBookingNote = useCourtScheduleStore(
    (state) => state.quickBookingNote
  )
  const setQuickBookingPlayerName = useCourtScheduleStore(
    (state) => state.setQuickBookingPlayerName
  )
  const setQuickBookingNote = useCourtScheduleStore(
    (state) => state.setQuickBookingNote
  )
  const closeQuickBooking = useCourtScheduleStore(
    (state) => state.closeQuickBooking
  )

  if (!quickBookingSlot) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quickBookingPlayerName.trim() && quickBookingNote.trim()) {
      onCreate(quickBookingPlayerName, quickBookingNote)
      closeQuickBooking()
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
