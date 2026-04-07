import { CoachPageHeader } from "@/features/coach/components/coach-page-header"
import { LessonPlanEditor } from "@/features/coach/components/lesson-plan-editor"

export default function NewLessonPlanPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title="Tạo giáo án mới"
          description="Khởi tạo giáo án, thêm sections và drill mock trước khi tích hợp API."
        />

        <LessonPlanEditor />
      </div>
    </div>
  )
}
