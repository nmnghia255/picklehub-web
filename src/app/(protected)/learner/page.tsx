import { PageContainer } from "@/components/page-container"
import { LearnerDetailTabs } from "@/features/learner/components/learner-detail-tabs"

export default function LearnerPage() {
  return (
    <PageContainer variant="wide" className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Người học</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý hồ sơ, lịch tập, thanh toán và khám phá huấn luyện viên.
        </p>
      </div>

      <LearnerDetailTabs />
    </PageContainer>
  )
}
