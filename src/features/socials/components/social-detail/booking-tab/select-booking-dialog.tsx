"use client"

import {
  Calendar,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  ShieldAlert,
} from "lucide-react"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateSocialBookingsAction } from "@/features/socials/actions/social"
import {
  getBookingTimeRange,
  normalizeBookingItems,
} from "@/features/socials/utils"
import { getMyBookingsAction } from "@/features/sport-center/actions/get-my-bookings"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

export interface CourtBookingAvailableItem {
  id: string
  centerName?: string
  courtName: string
  location?: string
  startTime: string
  endTime: string
  price?: number
}

interface SelectBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  socialId: string
  centerId?: string
  currentBookingIds: string[]
  availableBookings?: CourtBookingAvailableItem[]
}

function formatBookingTime(timeStr?: string): string {
  if (!timeStr) return ""
  if (timeStr.includes("T")) {
    const d = new Date(timeStr)
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }
  return timeStr
}

const EMPTY_BOOKINGS: CourtBookingAvailableItem[] = []

export default function SelectBookingDialog({
  open,
  onOpenChange,
  socialId,
  centerId,
  currentBookingIds,
  availableBookings = EMPTY_BOOKINGS,
}: SelectBookingDialogProps) {
  const { t } = useSocialsTranslation()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(currentBookingIds)
  )
  const [availableList, setAvailableList] =
    useState<CourtBookingAvailableItem[]>(availableBookings)
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    let isMounted = true
    if (centerId) {
      getMyBookingsAction({ centerId, limit: 200 })
        .then((res) => {
          if (!isMounted) return
          const rawList = res?.data || []
          const filtered = rawList
            .filter((b) => b.status === "CONFIRMED")
            .filter(
              (b) =>
                !b.linkedId ||
                b.linkedId === socialId ||
                currentBookingIds.includes(b.id)
            )
          const fetched = filtered.map((bItem: unknown) => {
            const booking = bItem as Record<string, unknown> & {
              id?: string
              totalAmount?: number
              price?: number
              center?: { name?: string; address?: string }
              court?: { centerName?: string; name?: string }
              centerName?: string
              courtName?: string
              location?: string
            }
            const timeRange = getBookingTimeRange(booking)
            const firstItem = normalizeBookingItems(booking)[0]

            return {
              id: booking.id || "",
              centerName:
                booking.center?.name ||
                booking.court?.centerName ||
                booking.centerName ||
                "",
              courtName:
                firstItem?.courtName ||
                booking.court?.name ||
                booking.courtName ||
                "Sân",
              location: booking.location || booking.center?.address,
              startTime: timeRange.startTime,
              endTime: timeRange.endTime,
              price: booking.totalAmount ?? booking.price,
            }
          })
          setAvailableList((prevList) => {
            const map = new Map<string, CourtBookingAvailableItem>()
            prevList.forEach((item) => map.set(item.id, item))
            fetched.forEach((item) => map.set(item.id, item))
            return Array.from(map.values())
          })
        })
        .catch(() => {
          if (isMounted) setAvailableList(availableBookings)
        })
        .finally(() => {
          if (isMounted) setIsLoadingList(false)
        })
    }

    return () => {
      isMounted = false
    }
  }, [open, centerId])

  const toggleBooking = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size <= 1) {
          toast.error(t("booking.minBookingError"))
          return prev
        }
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSubmit = async () => {
    const bookingIdsArray = Array.from(selectedIds)

    if (bookingIdsArray.length === 0) {
      toast.error(t("booking.minBookingError"))
      return
    }

    setIsSubmitting(true)
    try {
      await updateSocialBookingsAction(socialId, bookingIdsArray)
      toast.success(t("booking.updateSuccess"))
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("booking.updateError")
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="size-5 text-primary" />
            {t("booking.manageBookings")}
          </DialogTitle>
          <DialogDescription>{t("booking.selectDialogDesc")}</DialogDescription>
        </DialogHeader>

        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {isLoadingList ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
              <Loader2 className="mb-2 size-6 animate-spin text-primary" />
              <p>Đang tải danh sách đặt sân khả dụng...</p>
            </div>
          ) : availableList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
              <ShieldAlert className="mb-2 size-6 text-amber-500" />
              <p>{t("booking.noAvailableBookings")}</p>
            </div>
          ) : (
            availableList.map((b) => {
              const isChecked = selectedIds.has(b.id)
              const startDisplay = formatBookingTime(b.startTime)
              const endDisplay = formatBookingTime(b.endTime)

              return (
                <div
                  key={b.id}
                  onClick={() => toggleBooking(b.id)}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                    isChecked
                      ? "border-primary/50 bg-primary/5 dark:bg-primary/10"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleBooking(b.id)}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm leading-tight font-semibold">
                        {b.courtName} — {b.centerName || t("common.na")}
                      </p>
                      {b.price !== undefined && b.price > 0 && (
                        <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <DollarSign className="mr-0.5 size-3" />
                          {b.price.toLocaleString("vi-VN")} đ
                        </span>
                      )}
                    </div>

                    {b.location && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3 shrink-0" />
                        <span className="truncate">{b.location}</span>
                      </div>
                    )}

                    {(startDisplay || endDisplay) && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3 shrink-0" />
                        <span>
                          {startDisplay} {startDisplay && endDisplay ? "–" : ""}{" "}
                          {endDisplay}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <p className="self-center text-xs text-muted-foreground">
            {t("booking.selectedCount", { count: selectedIds.size })}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedIds.size === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                t("booking.saveBookings")
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
