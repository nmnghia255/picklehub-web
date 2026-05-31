import { CalendarClock } from "lucide-react"

interface BookingHistoryPageHeaderProps {
  totalBookings: number
}

export function BookingHistoryPageHeader({
  totalBookings,
}: BookingHistoryPageHeaderProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Lịch sử đặt sân
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Xem lại toàn bộ các lượt đặt bạn đã tạo, lọc nhanh theo trạng thái
              hoặc ngày đặt và theo dõi tiến trình.
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
