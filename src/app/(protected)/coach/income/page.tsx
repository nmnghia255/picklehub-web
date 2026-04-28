import { CoachIncomeOverview } from "@/features/coach/components/coach-income-overview"
import { CoachPageHeader } from "@/features/coach/components/coach-page-header"

export default function CoachIncomePage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title="Thống kê thu nhập"
          description="Lọc theo ngày, tháng hoặc năm, xem biểu đồ cột và danh sách giao dịch mock."
        />

        <CoachIncomeOverview />
      </div>
    </div>
  )
}
