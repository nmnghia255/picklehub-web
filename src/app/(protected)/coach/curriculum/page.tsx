import { CoachPageHeader } from "@/features/coach/components/coach-page-header"
import { LessonPlanList } from "@/features/coach/components/lesson-plan-list"

export default function CoachCurriculumPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title="Quản lý giáo án"
          description="Danh sách giáo án mock cho huấn luyện viên, có thể tạo mới, sửa, xóa và mở chi tiết."
        />

        <LessonPlanList />
      </div>
    </div>
  )
}
