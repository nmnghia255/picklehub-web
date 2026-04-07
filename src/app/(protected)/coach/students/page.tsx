import { CoachPageHeader } from "@/features/coach/components/coach-page-header"
import { CoachStudentsTable } from "@/features/coach/components/coach-students-table"
import { students } from "@/features/coach/data/mockStudents"

export default function CoachStudentsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title="Danh sách học viên"
          description="Tìm kiếm theo tên hoặc SĐT, lọc theo level và mở nhanh hồ sơ hoặc lộ trình của từng học viên."
        />

        <CoachStudentsTable students={students} />
      </div>
    </div>
  )
}
