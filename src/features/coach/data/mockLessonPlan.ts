export type LessonLevel = "Beginner" | "Intermediate" | "Advanced"

export type DrillDifficulty = "Easy" | "Medium" | "Hard"

export type Drill = {
  id: string
  name: string
  difficulty: DrillDifficulty
  players: number
}

export type LessonSection = {
  id: string
  title: string
  duration: number
  description: string
  drillIds: string[]
}

export type LessonPlan = {
  id: string
  name: string
  level: LessonLevel
  duration: number
  description: string
  usageCount: number
  sections: LessonSection[]
}

export const drills: Drill[] = [
  {
    id: "d1",
    name: "Forehand Drill",
    difficulty: "Easy",
    players: 2,
  },
  {
    id: "d2",
    name: "Volley Control",
    difficulty: "Medium",
    players: 2,
  },
  {
    id: "d3",
    name: "Dink Accuracy",
    difficulty: "Easy",
    players: 2,
  },
  {
    id: "d4",
    name: "Transition Footwork",
    difficulty: "Medium",
    players: 2,
  },
  {
    id: "d5",
    name: "Third Shot Drop",
    difficulty: "Hard",
    players: 2,
  },
  {
    id: "d6",
    name: "Live Point Play",
    difficulty: "Hard",
    players: 4,
  },
]

export const lessonPlans: LessonPlan[] = [
  {
    id: "lp1",
    name: "Beginner Session 1",
    level: "Beginner",
    duration: 60,
    description: "Buổi học cơ bản cho người mới",
    usageCount: 12,
    sections: [
      {
        id: "s1",
        title: "Khởi động",
        duration: 10,
        description: "Giãn cơ và làm nóng",
        drillIds: [],
      },
      {
        id: "s2",
        title: "Forehand cơ bản",
        duration: 20,
        description: "Học kỹ thuật forehand",
        drillIds: ["d1", "d2"],
      },
      {
        id: "s3",
        title: "Drill practice",
        duration: 30,
        description: "Thực hành theo cặp và ghép nhịp",
        drillIds: ["d3", "d4"],
      },
    ],
  },
  {
    id: "lp2",
    name: "Intermediate Rally Builder",
    level: "Intermediate",
    duration: 75,
    description: "Tăng kiểm soát nhịp, di chuyển và ra quyết định khi rally",
    usageCount: 8,
    sections: [
      {
        id: "s4",
        title: "Warm-up and reset",
        duration: 15,
        description: "Kích hoạt cơ thể và nhịp chân",
        drillIds: ["d4"],
      },
      {
        id: "s5",
        title: "Dink pressure",
        duration: 25,
        description: "Đẩy đối thủ ra khỏi vị trí thuận lợi",
        drillIds: ["d3", "d5"],
      },
      {
        id: "s6",
        title: "Point play",
        duration: 35,
        description: "Ứng dụng trong tình huống thi đấu thật",
        drillIds: ["d6"],
      },
    ],
  },
]

export function getDrillById(drillId: string) {
  return drills.find((drill) => drill.id === drillId)
}

export function cloneLessonPlans(input: LessonPlan[]) {
  return input.map((plan) => ({
    ...plan,
    sections: plan.sections.map((section) => ({
      ...section,
      drillIds: [...section.drillIds],
    })),
  }))
}
