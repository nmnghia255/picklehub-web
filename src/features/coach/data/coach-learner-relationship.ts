import type { CoachStudent } from "@/features/coach/data/coach-mock-data"
import { students as studentRecords } from "@/features/coach/data/mockStudents"
import { coachList } from "@/features/learner/data/learner-mock-data"

const coachLearnerMapping: { coachId: string; learnerId: string }[] = [
  { coachId: "c1", learnerId: "st-1" },
  { coachId: "c1", learnerId: "st-2" },
  { coachId: "c1", learnerId: "st-3" },
  { coachId: "c1", learnerId: "st-4" },
  { coachId: "c2", learnerId: "st-1" },
  { coachId: "c2", learnerId: "st-2" },
  { coachId: "c3", learnerId: "st-1" },
]

export function getCoachStudents(coachId: string): CoachStudent[] {
  const learnerIds = coachLearnerMapping
    .filter((m) => m.coachId === coachId)
    .map((m) => m.learnerId)

  return studentRecords
    .filter((s) => learnerIds.includes(s.id))
    .map((s) => ({
      id: s.id,
      name: s.name,
      level: s.level,
      registeredAt: "2026-01-15",
      status: "Đang học" as const,
    }))
}

export function getCoachStudentCount(coachId: string): number {
  return coachLearnerMapping.filter((m) => m.coachId === coachId).length
}

export function getCoachInfoById(coachId: string) {
  return coachList.find((c) => c.id === coachId)
}
