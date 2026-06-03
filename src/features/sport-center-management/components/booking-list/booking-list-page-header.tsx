"use client"

import { CalendarClock, ShieldCheck } from "lucide-react"

interface BookingListPageHeaderProps {
  totalBookings: number
}

export function BookingListPageHeader({
  totalBookings,
}: BookingListPageHeaderProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            Quản lý đặt sân
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Danh sách đặt sân
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Theo dõi toàn bộ lượt đặt do người chơi tạo, lọc theo ngày tạo và
              xử lý nhanh các yêu cầu chờ xác nhận.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
            <CalendarClock className="size-4 text-emerald-500" />
            {totalBookings} lượt đặt
          </div>
        </div>
      </div>
    </section>
  )
}
