export type LearningSkillStatus = "Not started" | "In progress" | "Completed"

export type LearningSkill = {
  id: string
  name: string
  status: LearningSkillStatus
  progress: number
  lessonPlans: string[]
}

export type LearningPath = {
  studentId: string
  studentName: string
  level: string
  completedPercent: number
  currentLevel: string
  skills: LearningSkill[]
}

export const learningPaths: LearningPath[] = [
  {
    studentId: "st-1",
    studentName: "An Nguyễn",
    level: "Beginner",
    completedPercent: 32,
    currentLevel: "Foundation",
    skills: [
      {
        id: "sk-1",
        name: "Serve",
        status: "In progress",
        progress: 35,
        lessonPlans: ["Beginner Session 1"],
      },
      {
        id: "sk-2",
        name: "Forehand",
        status: "In progress",
        progress: 45,
        lessonPlans: ["Beginner Session 1"],
      },
      {
        id: "sk-3",
        name: "Backhand",
        status: "Not started",
        progress: 10,
        lessonPlans: [],
      },
    ],
  },
  {
    studentId: "st-2",
    studentName: "Linh Trần",
    level: "Intermediate",
    completedPercent: 68,
    currentLevel: "Control & Transition",
    skills: [
      {
        id: "sk-4",
        name: "Serve",
        status: "Completed",
        progress: 90,
        lessonPlans: ["Intermediate Rally Builder"],
      },
      {
        id: "sk-5",
        name: "Forehand",
        status: "Completed",
        progress: 88,
        lessonPlans: ["Intermediate Rally Builder"],
      },
      {
        id: "sk-6",
        name: "Backhand",
        status: "In progress",
        progress: 62,
        lessonPlans: ["Intermediate Rally Builder"],
      },
    ],
  },
]

export function getLearningPathByStudentId(studentId: string) {
  return learningPaths.find((path) => path.studentId === studentId)
}
