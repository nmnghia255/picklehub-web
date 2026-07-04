"use client"

import { PageContainer } from "@/components/page-container"
import { CoachDiscoveryPage } from "@/features/coach/components/pages/coach-discovery-page-content"

export default function CoachesPage() {
  return (
    <PageContainer variant="wide" className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Khám phá huấn luyện viên</h1>
        <p className="text-sm text-muted-foreground">
          Tìm kiếm và kết nối với những huấn luyện viên pickleball phù hợp với bạn.
        </p>
      </div>
      <CoachDiscoveryPage />
    </PageContainer>
  )
}
