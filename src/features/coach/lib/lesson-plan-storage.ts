import {
  cloneLessonPlans,
  type LessonPlan,
  lessonPlans,
} from "@/features/coach/data/mockLessonPlan"

const STORAGE_KEY = "picklehub.lessonPlans"

export function getLessonPlansFromStorage() {
  if (typeof window === "undefined") {
    return cloneLessonPlans(lessonPlans)
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return cloneLessonPlans(lessonPlans)
  }

  try {
    const parsed = JSON.parse(raw) as LessonPlan[]
    return cloneLessonPlans(parsed)
  } catch {
    return cloneLessonPlans(lessonPlans)
  }
}

export function saveLessonPlansToStorage(plans: LessonPlan[]) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
}

export function findLessonPlanById(plans: LessonPlan[], lessonPlanId: string) {
  return plans.find((plan) => plan.id === lessonPlanId)
}

export function createLessonPlanId() {
  return `lp-${Date.now()}`
}
