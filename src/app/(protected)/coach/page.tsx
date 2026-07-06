import { PageContainer } from "@/components/page-container"
import { CoachDashboardGate } from "@/features/coach/components/coach-dashboard-gate"

export default function CoachDashboardPage() {
  return (
    <PageContainer variant="wide" className="space-y-6">
      <CoachDashboardGate />
    </PageContainer>
  )
}
