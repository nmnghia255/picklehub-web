import { CoachPageHeader } from "@/features/coach/components/coach-page-header"
import { CoachProfileForm } from "@/features/coach/components/coach-profile-form"

export default function CoachProfilePage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title="Hồ sơ chuyên môn"
          description="Cập nhật kinh nghiệm, kỹ năng và chứng chỉ để học viên có thể theo dõi hồ sơ của bạn."
        />

        <CoachProfileForm />
      </div>
    </div>
  )
}
