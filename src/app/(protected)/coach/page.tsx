import { CoachDashboardStats } from "@/features/coach/components/coach-dashboard-stats"
import { CoachPageHeader } from "@/features/coach/components/coach-page-header"

export default function CoachDashboardPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title="Dashboard HLV"
          description="Tổng quan nhanh hoạt động hôm nay, lịch dạy và các thao tác quan trọng của huấn luyện viên."
        />

        <CoachDashboardStats />
      </div>
    </div>
  )
}
