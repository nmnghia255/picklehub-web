import { PageContainer } from "@/components/page-container"
import { SportCenterManagementPage } from "@/features/sport-center-management/components/sport-center-management-page"

export default function SportCenterManagementListRoute() {
  return (
    <PageContainer variant="wide" className="space-y-6 pb-10">
      <SportCenterManagementPage />
    </PageContainer>
  )
}
