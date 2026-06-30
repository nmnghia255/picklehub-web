export type DashboardStat = {
  label: string
  value: string
  hint: string
}

export type TodayScheduleItem = {
  id: string
  time: string
  target: string
  location: string
  lessonPlan: string
  status: "Sắp bắt đầu" | "Đang diễn ra" | "Chưa bắt đầu"
}

export const dashboardStats: DashboardStat[] = [
  { label: "Số buổi hôm nay", value: "5", hint: "+2 so với hôm qua" },
  { label: "Tổng học viên", value: "84", hint: "12 học viên mới trong tuần" },
  {
    label: "Thu nhập tháng",
    value: "42.5M",
    hint: "Dữ liệu mock tháng hiện tại",
  },
  { label: "Rating trung bình", value: "4.8", hint: "45 lượt đánh giá" },
]

export const todaySchedule: TodayScheduleItem[] = [
  {
    id: "today-1",
    time: "08:00 - 09:00",
    target: "An Nguyễn",
    location: "Sân A2 - PickleHub Center",
    lessonPlan: "Beginner Session 1",
    status: "Sắp bắt đầu",
  },
  {
    id: "today-2",
    time: "10:30 - 11:30",
    target: "Nhóm Intermediate",
    location: "Sân B1 - PickleHub Center",
    lessonPlan: "Intermediate Rally Builder",
    status: "Đang diễn ra",
  },
  {
    id: "today-3",
    time: "14:00 - 15:00",
    target: "Linh Trần",
    location: "Google Meet",
    lessonPlan: "Advanced Court Control",
    status: "Chưa bắt đầu",
  },
]

export const quickActions = [
  { label: "Hồ sơ HLV", href: "/coach/profile" },
  { label: "Tạo lịch dạy", href: "/coach/schedule" },
  { label: "Thêm học viên", href: "/coach/students" },
] as const
