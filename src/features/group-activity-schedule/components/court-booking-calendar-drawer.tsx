"use client"

import { Calendar, CalendarClock, MapPin, Receipt, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import type { CourtBookingCalendarEvent } from "../group-activity-schedule.types"
import { formatDateTime, formatTime } from "../group-activity-schedule.utils"

interface CourtBookingCalendarDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CourtBookingCalendarEvent
  canManage?: boolean
  onUnlink?: (id: string) => void
}

export function CourtBookingCalendarDrawer({
  open,
  onOpenChange,
  event,
  canManage = false,
  onUnlink,
}: CourtBookingCalendarDrawerProps) {
  const isMobile = useIsMobile()
  const { metadata } = event

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent className="max-h-screen lg:max-w-xl">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <span>🎾</span>
            <span>{event.title}</span>
          </DrawerTitle>
          <DrawerDescription>Chi tiết lịch đặt sân của nhóm.</DrawerDescription>

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="bg-sky-100 text-sky-700 hover:bg-sky-100/80"
            >
              Lịch đặt sân
            </Badge>
          </div>
        </DrawerHeader>

        <ScrollArea className="h-[calc(100vh-9rem)] px-4 pb-6">
          <div className="space-y-6">
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-start gap-2 text-sm">
                <CalendarClock className="mt-0.5 size-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">Thời gian</span>
                  <span className="text-muted-foreground">
                    {event.startAt ? formatDateTime(event.startAt) : ""}
                    {event.startAt &&
                    event.endAt &&
                    event.startAt !== event.endAt
                      ? ` - ${formatTime(event.endAt)}`
                      : ""}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">{metadata.centerName}</span>
                  {metadata.centerAddress && (
                    <span className="text-muted-foreground">
                      {metadata.centerAddress}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Receipt className="mt-0.5 size-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">Tổng chi phí</span>
                  <span className="font-bold text-primary">
                    {formatCurrencyVnd(metadata.totalBookingCost)}
                  </span>
                </div>
              </div>

              {metadata.note && (
                <div className="mt-2 text-sm text-muted-foreground italic">
                  &ldquo;{metadata.note}&rdquo;
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="size-4" />
                Danh sách sân đặt
              </h4>
              <div className="grid gap-2">
                {metadata.bookingItemsSnapshot.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md border bg-accent/30 px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{item.courtName}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>
                    <Badge variant="outline">Sân bãi</Badge>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {metadata.creator && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Người liên kết:</span>
                <span className="font-medium text-foreground">
                  {metadata.creator.name}
                </span>
              </div>
            )}
          </div>
        </ScrollArea>

        {canManage && onUnlink && (
          <DrawerFooter className="border-t px-4 py-3">
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => onUnlink(event.id)}
            >
              <Trash2 className="mr-2 size-4" />
              Xóa liên kết
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
