export type MatchStatus =
  | "scheduled"
  | "ready"
  | "in_progress"
  | "completed"
  | "walkover"
  | "pending"

export interface MatchTeam {
  name: string
  seed?: number
  rating?: number
  score?: number
}

export interface MatchWarning {
  type: "player_conflict" | "rest_time" | "court_conflict"
  message: string
}

export interface Match {
  id: number | string
  match?: string
  event?: string
  round?: string

  team1?: MatchTeam | string
  team2?: MatchTeam | string
  winner?: number // 1 for team1, 2 for team2

  score?: string
  status: MatchStatus

  court?: string
  time?: string
  startTime?: string
  duration?: number
  priority?: "low" | "medium" | "high"

  players?: string[]
  warnings?: MatchWarning[]
}
