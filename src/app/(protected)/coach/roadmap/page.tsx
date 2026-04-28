import { CoachPageHeader } from "@/features/coach/components/coach-page-header"
import { CoachRoadmapBuilder } from "@/features/coach/components/coach-roadmap-builder"

interface CoachRoadmapPageProps {
  searchParams: Promise<{ studentId?: string }>
}

export default async function CoachRoadmapPage({
  searchParams,
}: CoachRoadmapPageProps) {
  const { studentId } = await searchParams

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title="Lộ trình cá nhân hóa"
          description="Theo dõi tiến độ học viên, gắn lesson plan vào từng skill và quản lý roadmap theo mock state."
        />

        <CoachRoadmapBuilder studentId={studentId} />
      </div>
    </div>
  )
}
