export type StudentLevel = "Beginner" | "Intermediate" | "Advanced"

export type StudentRecord = {
  id: string
  name: string
  phone: string
  avatar: string
  level: StudentLevel
  sessionsCompleted: number
  currentPlan: string
  email: string
  notes: string
}

export type StudentLessonHistoryItem = {
  date: string
  lessonPlan: string
  status: "Hoàn thành" | "Đã lên lịch"
}

export type StudentProgressSkill = {
  name: string
  progress: number
  status: "Not started" | "In progress" | "Completed"
}

export type StudentProfile = StudentRecord & {
  age: number
  joinedAt: string
  improvementNote: string
  history: StudentLessonHistoryItem[]
  progressSkills: StudentProgressSkill[]
}

export const students: StudentRecord[] = [
  {
    id: "st-1",
    name: "An Nguyễn",
    phone: "0901 234 567",
    avatar: "/mock/students/an.png",
    level: "Beginner",
    sessionsCompleted: 12,
    currentPlan: "Beginner Session 1",
    email: "an.nguyen@example.com",
    notes: "Ưu tiên chỉnh tư thế và nhịp chân.",
  },
  {
    id: "st-2",
    name: "Linh Trần",
    phone: "0902 345 678",
    avatar: "/mock/students/linh.png",
    level: "Intermediate",
    sessionsCompleted: 24,
    currentPlan: "Intermediate Rally Builder",
    email: "linh.tran@example.com",
    notes: "Phản xạ tốt, cần tăng ổn định khi rally dài.",
  },
  {
    id: "st-3",
    name: "Phúc Lê",
    phone: "0903 456 789",
    avatar: "/mock/students/phuc.png",
    level: "Advanced",
    sessionsCompleted: 38,
    currentPlan: "Advanced Court Control",
    email: "phuc.le@example.com",
    notes: "Đánh đôi tốt, cần chi tiết hóa chiến thuật.",
  },
  {
    id: "st-4",
    name: "Khánh Bùi",
    phone: "0904 567 890",
    avatar: "/mock/students/khanh.png",
    level: "Intermediate",
    sessionsCompleted: 18,
    currentPlan: "Intermediate Rally Builder",
    email: "khanh.bui@example.com",
    notes: "Cần cải thiện ổn định forehand.",
  },
]

export const studentProfiles: StudentProfile[] = [
  {
    ...students[0],
    age: 24,
    joinedAt: "2026-01-12",
    improvementNote: "Tiến bộ nhanh trong kỹ thuật căn bản.",
    history: [
      {
        date: "2026-04-01",
        lessonPlan: "Beginner Session 1",
        status: "Hoàn thành",
      },
      {
        date: "2026-04-08",
        lessonPlan: "Beginner Session 1",
        status: "Đã lên lịch",
      },
    ],
    progressSkills: [
      { name: "Serve", progress: 25, status: "In progress" },
      { name: "Forehand", progress: 40, status: "In progress" },
      { name: "Backhand", progress: 10, status: "Not started" },
    ],
  },
  {
    ...students[1],
    age: 28,
    joinedAt: "2025-12-03",
    improvementNote: "Cần thêm độ ổn định ở pha chuyển đổi.",
    history: [
      {
        date: "2026-04-02",
        lessonPlan: "Intermediate Rally Builder",
        status: "Hoàn thành",
      },
      {
        date: "2026-04-09",
        lessonPlan: "Intermediate Rally Builder",
        status: "Đã lên lịch",
      },
    ],
    progressSkills: [
      { name: "Serve", progress: 60, status: "Completed" },
      { name: "Forehand", progress: 72, status: "Completed" },
      { name: "Backhand", progress: 50, status: "In progress" },
    ],
  },
  {
    ...students[2],
    age: 31,
    joinedAt: "2025-10-25",
    improvementNote: "Chiến thuật ổn, nên duy trì cường độ.",
    history: [
      {
        date: "2026-03-28",
        lessonPlan: "Advanced Court Control",
        status: "Hoàn thành",
      },
      {
        date: "2026-04-05",
        lessonPlan: "Advanced Court Control",
        status: "Đã lên lịch",
      },
    ],
    progressSkills: [
      { name: "Serve", progress: 80, status: "Completed" },
      { name: "Forehand", progress: 85, status: "Completed" },
      { name: "Backhand", progress: 70, status: "In progress" },
    ],
  },
]

export function getStudentProfile(studentId: string) {
  return studentProfiles.find((student) => student.id === studentId)
}
