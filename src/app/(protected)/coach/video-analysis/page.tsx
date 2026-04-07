import { CoachPageHeader } from "@/features/coach/components/coach-page-header"
import { CoachVideoAnalysis } from "@/features/coach/components/coach-video-analysis"

export default function CoachVideoAnalysisPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title="Phân tích video kỹ thuật"
          description="Upload video, phát trực tiếp, gắn note theo timestamp và tag kỹ thuật cho phân tích nhanh."
        />

        <CoachVideoAnalysis />
      </div>
    </div>
  )
}
