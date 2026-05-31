"use client"

import { CalendarClock, Hash, LayoutGrid, MapPinned } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatDateTime } from "@/features/sport-center-management/revenue-report/utils/format"
import type { Court } from "@/features/sport-center-management/types"

import { CourtStatusBadge, CourtTypeBadge } from "./court-badges"

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium break-words text-foreground">
        {value}
      </p>
    </div>
  )
}

export function CourtDetailDrawer({
  court,
  centerName,
  open,
  onOpenChange,
}: {
  court: Court | null
  centerName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        {court ? (
          <div className="flex h-full flex-col overflow-y-auto">
            <SheetHeader className="border-b px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <SheetTitle className="text-xl">{court.name}</SheetTitle>
                  <SheetDescription>
                    {centerName
                      ? `Thông tin sân tại ${centerName}`
                      : "Thông tin chi tiết sân"}
                  </SheetDescription>
                </div>
                <CourtStatusBadge status={court.status} />
              </div>
            </SheetHeader>

            <div className="space-y-6 px-6 py-5">
              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <LayoutGrid className="size-4 text-sky-500" />
                  Thông tin sân
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock label="Tên sân" value={court.name} />
                  <div className="rounded-2xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Loại sân</p>
                    <div className="mt-1">
                      <CourtTypeBadge type={court.type} />
                    </div>
                  </div>
                  <div className="rounded-2xl border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Trạng thái</p>
                    <div className="mt-1">
                      <CourtStatusBadge status={court.status} />
                    </div>
                  </div>
                  {centerName ? (
                    <DetailBlock label="Trung tâm" value={centerName} />
                  ) : null}
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Hash className="size-4 text-violet-500" />
                  Định danh & thời gian
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailBlock label="Mã sân" value={court.id} />
                  <DetailBlock label="Mã trung tâm" value={court.centerId} />
                  <DetailBlock
                    label="Ngày tạo"
                    value={formatDateTime(court.createdAt)}
                  />
                  <DetailBlock
                    label="Cập nhật gần nhất"
                    value={formatDateTime(court.updatedAt)}
                  />
                </div>
              </section>

              <section className="flex items-start gap-2 rounded-2xl border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
                <CalendarClock className="mt-0.5 size-4 shrink-0" />
                <p>
                  Giá thuê và giờ mở cửa được cấu hình ở cấp trung tâm. Vui lòng
                  xem trong thông tin trung tâm{" "}
                  <MapPinned className="inline size-3" />.
                </p>
              </section>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-6 py-10 text-sm text-muted-foreground">
            Chưa chọn sân nào.
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
