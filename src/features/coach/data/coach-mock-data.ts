export type CoachStudent = {
  id: string
  name: string
  level: "Beginner" | "Intermediate" | "Advanced"
  registeredAt: string
  status: "Đang học" | "Tạm dừng"
}

export const coachStats = [
  { label: "Tổng học viên", value: "64" },
  { label: "Buổi dạy hôm nay", value: "5" },
  { label: "Video chờ nhận xét", value: "12" },
  { label: "Thu nhập dự kiến", value: "42.500.000đ" },
]

export const upcomingSchedules = [
  {
    id: "s1",
    studentName: "An Nguyễn",
    time: "08:00 - 09:00",
    format: "Offline",
    location: "Sân A2 - PickleHub Center",
  },
  {
    id: "s2",
    studentName: "Linh Trần",
    time: "10:30 - 11:30",
    format: "Online",
    location: "Google Meet",
  },
  {
    id: "s3",
    studentName: "Phúc Lê",
    time: "14:00 - 15:00",
    format: "Offline",
    location: "Sân B1 - PickleHub Center",
  },
]

export const students: CoachStudent[] = [
  {
    id: "st-1",
    name: "An Nguyễn",
    level: "Beginner",
    registeredAt: "2026-01-12",
    status: "Đang học",
  },
  {
    id: "st-2",
    name: "Linh Trần",
    level: "Intermediate",
    registeredAt: "2026-02-03",
    status: "Đang học",
  },
  {
    id: "st-3",
    name: "Phúc Lê",
    level: "Advanced",
    registeredAt: "2025-11-25",
    status: "Tạm dừng",
  },
  {
    id: "st-4",
    name: "Khánh Bùi",
    level: "Intermediate",
    registeredAt: "2026-01-28",
    status: "Đang học",
  },
]

export const monthlyIncome = [
  { month: "T1", revenue: 22000000 },
  { month: "T2", revenue: 27500000 },
  { month: "T3", revenue: 31800000 },
  { month: "T4", revenue: 29500000 },
  { month: "T5", revenue: 35600000 },
  { month: "T6", revenue: 42500000 },
]

export const incomeTransactions = [
  {
    id: "tx-1001",
    studentName: "An Nguyễn",
    amount: "1.200.000đ",
    date: "2026-04-01",
    method: "Chuyển khoản",
  },
  {
    id: "tx-1002",
    studentName: "Linh Trần",
    amount: "1.500.000đ",
    date: "2026-04-02",
    method: "Ví điện tử",
  },
  {
    id: "tx-1003",
    studentName: "Khánh Bùi",
    amount: "900.000đ",
    date: "2026-04-02",
    method: "Tiền mặt",
  },
]

export const videoFeedbackSamples = [
  {
    id: "fb-1",
    timestamp: 25,
    note: "Giữ cổ tay ổn định hơn ở pha volley đầu tiên.",
  },
  {
    id: "fb-2",
    timestamp: 48,
    note: "Bước chân trái vào hơi chậm, cần dịch chuyển sớm hơn.",
  },
  {
    id: "fb-3",
    timestamp: 72,
    note: "Follow-through tốt, giữ nhịp tương tự ở các pha tiếp theo.",
  },
]
