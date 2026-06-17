import type { TournamentStatus } from "../types/tournament"

export const statusConfig: Record<
  TournamentStatus,
  { labelKey: string; color: string }
> = {
  draft: {
    labelKey: "list.statuses.draft",
    color: "bg-gray-100 text-gray-700",
  },
  published: {
    labelKey: "list.statuses.published",
    color: "bg-blue-100 text-blue-700",
  },
  open_registration: {
    labelKey: "list.statuses.open_registration",
    color: "bg-emerald-100 text-emerald-700",
  },
  in_progress: {
    labelKey: "list.statuses.in_progress",
    color: "bg-yellow-100 text-yellow-700",
  },
  completed: {
    labelKey: "list.statuses.completed",
    color: "bg-purple-100 text-purple-700",
  },
}
