import type { ServerId } from "../stores/use-score-store"

export const TEAM_COLOR = {
  A: {
    score: "text-blue-600 dark:text-blue-600",
    chip: "bg-blue-600 text-white",
    servingDot: "bg-blue-500",
    servingRing: "ring-blue-500",
    actionButton: "bg-blue-600 text-white hover:bg-blue-500",
    actionHint: "text-white/80",
  },
  B: {
    score: "text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-600 text-white",
    servingDot: "bg-emerald-500",
    servingRing: "ring-emerald-500",
    actionButton: "bg-emerald-600 text-white hover:bg-emerald-500",
    actionHint: "text-white/80",
  },
} as const

export function getTeamASlots(isA1Right: boolean) {
  return {
    left: {
      id: (isA1Right ? "A2" : "A1") as ServerId,
      label: isA1Right ? "A2" : "A1",
    },
    right: {
      id: (isA1Right ? "A1" : "A2") as ServerId,
      label: isA1Right ? "A1" : "A2",
    },
  }
}

export function getTeamBSlots(isB1Right: boolean) {
  return {
    left: {
      id: (isB1Right ? "B2" : "B1") as ServerId,
      label: isB1Right ? "B2" : "B1",
    },
    right: {
      id: (isB1Right ? "B1" : "B2") as ServerId,
      label: isB1Right ? "B1" : "B2",
    },
  }
}
