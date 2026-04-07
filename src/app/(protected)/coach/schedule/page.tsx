import { CoachPageHeader } from "@/features/coach/components/coach-page-header"
import { CoachWeekSchedule } from "@/features/coach/components/coach-week-schedule"

export default function CoachSchedulePage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title="Lịch huấn luyện"
          description="Week view và day view trực quan để tạo lịch, xem chi tiết buổi học và quản lý trạng thái ngay tại màn hình."
        />

        <CoachWeekSchedule />
      </div>
    </div>
  )
}
