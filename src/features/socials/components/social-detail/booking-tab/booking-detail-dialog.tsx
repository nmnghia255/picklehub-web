"use client"

import { Building2, Calendar, Clock, Coins, MapPin, Trophy } from "lucide-react"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SocialBookingItem } from "@/features/socials/types/social"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface BookingDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking:
    | (SocialBookingItem & {
        items?: Array<{
          id?: string
          courtId?: string
          courtName: string
          startTime: string
          endTime: string
          price?: number
        }>
      })
    | null
}

function safeFormatTime(dateStr?: string): string {
  if (!dateStr || dateStr.trim() === "") return "07:00"
  const trimmed = dateStr.trim()
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return trimmed.slice(0, 5)
  }
  const d = new Date(trimmed)
  if (isNaN(d.getTime())) return "07:00"
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function BookingDetailDialog({
  open,
  onOpenChange,
  booking,
}: BookingDetailDialogProps) {
  const { t } = useSocialsTranslation()

  if (!booking) return null

  const items = booking.items || [
    {
      courtName: booking.courtName,
      startTime: booking.startTime,
      endTime: booking.endTime,
      price: booking.price,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-primary" />
            Chi Tiết Đơn Đặt Sân
          </DialogTitle>
          <DialogDescription className="text-xs">
            Mã đơn:{" "}
            <span className="font-mono font-medium text-foreground">
              {booking.id}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Thông tin Cụm Sân & Địa chỉ */}
          <div className="space-y-2 rounded-xl border bg-muted/20 p-3.5">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Building2 className="size-4 shrink-0 text-primary" />
              <span>{booking.centerName || t("common.na")}</span>
            </div>
            {booking.location && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span className="leading-relaxed">{booking.location}</span>
              </div>
            )}
          </div>

          {/* Danh Sách Các Sân Đặt (Booking Items) */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Danh Sách Sân Thi Đấu ({items.length} sân)
            </h4>
            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={item.id || item.courtId || idx}
                  className="flex items-center justify-between rounded-xl border bg-card p-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Badge
                        variant="outline"
                        className="border-primary/30 text-primary"
                      >
                        {item.courtName}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-3 shrink-0 text-muted-foreground" />
                      <span>
                        {safeFormatTime(item.startTime)} –{" "}
                        {safeFormatTime(item.endTime)}
                      </span>
                    </div>
                  </div>

                  {item.price !== undefined && item.price > 0 && (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {item.price.toLocaleString("vi-VN")} đ
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tổng Chi Phí */}
          {booking.price !== undefined && booking.price > 0 && (
            <div className="flex items-center justify-between rounded-xl border bg-emerald-500/10 p-3.5 text-emerald-700 dark:text-emerald-300">
              <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                <Coins className="size-4" />
                Tổng Chi Phí Đơn Đặt Sân
              </span>
              <span className="text-base font-black">
                {booking.price.toLocaleString("vi-VN")} đ
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.close", "Đóng")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
