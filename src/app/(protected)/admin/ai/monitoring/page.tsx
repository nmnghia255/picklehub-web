import { AiMonitoringView } from "@/features/admin/components/ai-monitoring-view"

export const metadata = {
  title: "AI Monitoring | PickleHub Admin",
  description: "Thống kê chỉ số & lịch sử request gọi AI",
}

export default function AiMonitoringPage() {
  return <AiMonitoringView />
}
