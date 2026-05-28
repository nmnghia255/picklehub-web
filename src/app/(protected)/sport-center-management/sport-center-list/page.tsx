import { PageContainer } from "@/components/page-container"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/features/sport-center/components/sport-center-listing/empty-state"
import { SportCenterOwnerService } from "@/features/sport-center-management/api/sport-center-service"
import { SportCenterCard } from "@/features/sport-center-management/components/sport-center-card"
import type { SportCenter } from "@/features/sport-center-management/types/sport-center"

export default async function SportCenterList() {
  let sportCenters: SportCenter[] = []

  try {
    sportCenters = await SportCenterOwnerService.listOwnerSportCenters()
  } catch (error) {
    console.error("Failed to fetch sport centers or bookings:", error)
    return (
      <PageContainer variant="wide">
        <div className="p-4">
          <p className="text-red-500">
            Không thể tải danh sách trung tâm thể thao. Vui lòng thử lại sau.
          </p>
        </div>
      </PageContainer>
    )
  }

  const activeSportCenterCount = sportCenters.filter(
    (sportCenter) => sportCenter.status === "ACTIVE"
  ).length
  const inactiveSportCenterCount = sportCenters.length - activeSportCenterCount

  return (
    <PageContainer
      variant="wide"
      className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-6"
    >
      <header className="flex flex-col gap-3 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Danh sách trung tâm của bạn
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Tất cả trung tâm thể thao bạn sở hữu được hiển thị tại đây để bạn
            chuyển nhanh sang từng khu vực quản lý.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Tổng {sportCenters.length}</Badge>
          <Badge className="bg-emerald-500 text-white">
            {activeSportCenterCount} đang hoạt động
          </Badge>
          <Badge variant="secondary">
            {inactiveSportCenterCount} tạm ngưng
          </Badge>
        </div>
      </header>

      <section className="space-y-4">
        {sportCenters.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sportCenters.map((sportCenter) => (
              <SportCenterCard key={sportCenter.id} sportCenter={sportCenter} />
            ))}
          </div>
        ) : (
          <EmptyState variant="sport-center" />
        )}
      </section>
    </PageContainer>
  )
}
