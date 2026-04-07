import { CoachPageHeader } from "@/features/coach/components/coach-page-header"
import { LessonPlanDetail } from "@/features/coach/components/lesson-plan-detail"

interface LessonPlanDetailPageProps {
  params: Promise<{ lessonPlanId: string }>
}

export default async function LessonPlanDetailPage({
  params,
}: LessonPlanDetailPageProps) {
  const { lessonPlanId } = await params

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title="Chi tiết giáo án"
          description="Timeline buổi dạy và drills gắn cho từng section để HLV nhìn nhanh khi đứng lớp."
        />

        <LessonPlanDetail lessonPlanId={lessonPlanId} />
      </div>
    </div>
  )
}
