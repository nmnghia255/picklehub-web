import { PageContainer } from "@/components/page-container"
import { CoachDetailTabs } from "@/features/coach/components/coach-detail-tabs"

export default function CoachDashboardPage() {
  return (
    <PageContainer variant="wide" className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Huấn luyện viên
        </h1>
        <p className="text-sm text-muted-foreground">
          Quản lý hồ sơ, học viên, lịch tập và thu chi của huấn luyện viên.
        </p>
      </div>

      <CoachDetailTabs />
    </PageContainer>
  )
}
