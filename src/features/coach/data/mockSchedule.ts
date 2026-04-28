export type ScheduleView = "week" | "day"

export type ScheduleBlock = {
  id: string
  day: string
  startTime: string
  endTime: string
  student: string
  lessonPlan: string
  location: string
  status: "Đã hoàn thành" | "Chưa hoàn thành"
  note: string
}

export const scheduleBlocks: ScheduleBlock[] = [
  {
    id: "sc-1",
    day: "Thứ 2",
    startTime: "08:00",
    endTime: "09:00",
    student: "An Nguyễn",
    lessonPlan: "Beginner Session 1",
    location: "Sân A2 - PickleHub Center",
    status: "Đã hoàn thành",
    note: "Tập trung serve và footwork.",
  },
  {
    id: "sc-2",
    day: "Thứ 2",
    startTime: "10:30",
    endTime: "11:30",
    student: "Nhóm Intermediate",
    lessonPlan: "Intermediate Rally Builder",
    location: "Sân B1 - PickleHub Center",
    status: "Chưa hoàn thành",
    note: "Tăng tốc độ chuyển trạng thái.",
  },
  {
    id: "sc-3",
    day: "Thứ 3",
    startTime: "14:00",
    endTime: "15:00",
    student: "Linh Trần",
    lessonPlan: "Intermediate Rally Builder",
    location: "Google Meet",
    status: "Chưa hoàn thành",
    note: "Buổi online, chú ý phản hồi nhanh.",
  },
]

export const weekDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]
export const daySlots = ["08:00", "10:00", "13:30", "15:00", "17:00"]
