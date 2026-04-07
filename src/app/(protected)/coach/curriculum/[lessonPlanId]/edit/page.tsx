import { CoachPageHeader } from "@/features/coach/components/coach-page-header"
import { LessonPlanEditor } from "@/features/coach/components/lesson-plan-editor"

interface EditLessonPlanPageProps {
  params: Promise<{ lessonPlanId: string }>
}

export default async function EditLessonPlanPage({
  params,
}: EditLessonPlanPageProps) {
  const { lessonPlanId } = await params

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title="Chỉnh sửa giáo án"
          description="Cập nhật thông tin chung, sections và drills từ mock state hiện tại."
        />

        <LessonPlanEditor lessonPlanId={lessonPlanId} />
      </div>
    </div>
  )
}
