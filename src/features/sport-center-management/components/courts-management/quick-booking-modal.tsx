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
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { useCourtScheduleStore } from "../../stores/court-schedule-store"

interface QuickBookingModalProps {
  onClose: () => void
  onCreate: (playerName: string, phone: string, note: string) => Promise<void>
}

export function QuickBookingModal({
  onClose,
  onCreate,
}: QuickBookingModalProps) {
  const { t } = useSportCenterManagementTranslation()
  const quickBookingSlot = useCourtScheduleStore(
    (state) => state.quickBookingSlot
  )
  const quickBookingSlots = useCourtScheduleStore(
    (state) => state.quickBookingSlots
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

  const selectedCenter = useCourtScheduleStore((state) => state.selectedCenter)

  const activeSlots =
    quickBookingSlots && quickBookingSlots.length > 0
      ? quickBookingSlots
      : quickBookingSlot
        ? [quickBookingSlot]
        : []

  if (activeSlots.length === 0) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getSlotPrice = (time: string) => {
    if (!selectedCenter) return 0
    const basePrice = selectedCenter.basePrice || 0
    const priceSlots = selectedCenter.priceSlots || []

    const matchedSlot = priceSlots.find(
      (ps) => ps.startTime <= time && time < ps.endTime
    )

    const pricePerHour = matchedSlot ? matchedSlot.pricePerHour : basePrice
    return pricePerHour / 2
  }

  const groupedByCourt = activeSlots.reduce<
    Record<string, { time: string; price: number }[]>
  >((acc, slot) => {
    const price = getSlotPrice(slot.time)
    acc[slot.courtName] = acc[slot.courtName] || []
    acc[slot.courtName].push({ time: slot.time, price })
    return acc
  }, {})

  const totalPrice = activeSlots.reduce((sum, slot) => {
    return sum + getSlotPrice(slot.time)
  }, 0)

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
      open={activeSlots.length > 0}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("courts.quickBooking.title")}</DialogTitle>
        </DialogHeader>

        <div className="mb-4 space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
            <p className="text-xs font-semibold tracking-wider text-emerald-950 uppercase">
              {t("courts.quickBooking.slotsCount", {
                count: activeSlots.length,
              })}
            </p>
            <p className="text-xs font-bold text-emerald-950">
              {t("courts.quickBooking.totalPrice")}:{" "}
              <span className="text-sm font-extrabold text-emerald-700">
                {formatCurrency(totalPrice)}
              </span>
            </p>
          </div>

          <div className="space-y-4 text-sm text-emerald-900">
            {Object.entries(groupedByCourt).map(([courtName, slots]) => (
              <div key={courtName} className="space-y-1">
                <span className="font-semibold text-emerald-950">
                  {courtName}:
                </span>
                <div className="mt-2 flex flex-wrap gap-2 pl-2 text-xs">
                  {slots.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-100/80 px-2 py-0.5 font-medium text-emerald-900"
                    >
                      <span>{s.time}</span>
                      <span className="font-semibold text-emerald-700">
                        ({formatCurrency(s.price)})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Player Name */}
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              {t("courts.quickBooking.playerName")}
            </label>
            <div className="relative">
              <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={quickBookingPlayerName}
                onChange={(e) => setQuickBookingPlayerName(e.target.value)}
                placeholder={t("courts.quickBooking.playerNamePlaceholder")}
                className="bg-input-background w-full rounded-lg border border-border py-2 pr-4 pl-10 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>
          {/* Phone number */}
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              {t("courts.quickBooking.phone")}
            </label>
            <div className="relative">
              <Phone className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={quickBookingPhone}
                onChange={(e) => setQuickBookingPhone(e.target.value)}
                placeholder={t("courts.quickBooking.phonePlaceholder")}
                className="bg-input-background w-full rounded-lg border border-border py-2 pr-4 pl-10 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              {t("courts.quickBooking.note")}
            </label>
            <div className="relative">
              <textarea
                value={quickBookingNote}
                onChange={(e) => setQuickBookingNote(e.target.value)}
                placeholder={t("courts.quickBooking.notePlaceholder")}
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
              {t("courts.quickBooking.cancel")}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-linear-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 sm:flex-none"
            >
              {t("courts.quickBooking.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
