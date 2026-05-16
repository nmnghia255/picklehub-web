"use client"

import { Phone, User } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface QuickBookingModalProps {
  slot: { court: string; time: string } | null
  onClose: () => void
  onCreate: (playerName: string, contact: string) => void
}

export function QuickBookingModal({
  slot,
  onClose,
  onCreate,
}: QuickBookingModalProps) {
  const [playerName, setPlayerName] = useState("")
  const [contact, setContact] = useState("")

  if (!slot) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (playerName.trim() && contact.trim()) {
      onCreate(playerName, contact)
      setPlayerName("")
      setContact("")
    }
  }

  return (
    <Dialog open={Boolean(slot)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đặt sân nhanh</DialogTitle>
        </DialogHeader>

        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">
            <span className="text-emerald-900">{slot.court}</span> lúc{" "}
            <span className="text-emerald-900">{slot.time}</span>
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
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Nhập tên người chơi"
                className="bg-input-background w-full rounded-lg border border-border py-2 pr-4 pl-10 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Số liên hệ
            </label>
            <div className="relative">
              <Phone className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Ví dụ: 0901 234 567"
                className="bg-input-background w-full rounded-lg border border-border py-2 pr-4 pl-10 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-2 sm:justify-end">
            <Button
              type="button"
              onClick={onClose}
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
