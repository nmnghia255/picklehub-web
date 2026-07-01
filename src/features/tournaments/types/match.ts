export type MatchStatus =
  | "scheduled"
  | "ready"
  | "in_progress"
  | "completed"
  | "walkover"
  | "pending"

export interface MatchTeam {
  teamId?: number
  name: string
  seed?: number | null
  rating?: number | null
  score?: number
}

export interface MatchWarning {
  type: "player_conflict" | "rest_time" | "court_conflict"
  message: string
}

export interface Match {
  id: number | string
  tournamentId?: number
  eventId?: number
  event?: string | null
  round?: string | null
  team1Id?: number | null
  team1?: MatchTeam | string | null
  team2Id?: number | null
  team2?: MatchTeam | string | null
  winner?: string | number | null
  score?: string | null
  status: string
  court?: string | null
  courtId?: string | null
  courtStatus?: string | null
  time?: string | null
  startTime?: string | null
  duration?: number | null
  priority?: string | null
  refereeId?: string | null
  refereeName?: string | null
  externalMatchId?: string | null
  bracketPosition?: number | null
  nextMatchId?: number | null
  loserMatchId?: number | null
  stage?: string | null
  bookingId?: number | null
  bookingItemId?: string | null

  // Keep compatibility fields
  match?: string
  players?: string[]
  warnings?: MatchWarning[]
}

export type ScoringTeam = "TEAM_A" | "TEAM_B"
export type WinnerTeam = "TEAM_A" | "TEAM_B" | "DRAW"
export type MatchEventType = "point-scored" | "point-undone" | "match-completed"

export interface MatchScoreHistory {
  id: string
  matchId: string
  setId: number
  scoringTeam: ScoringTeam
  pointType: string
  timestamp: string
}

export interface ScorePointPayload {
  matchId: string
  setId: number
  scoringTeam: ScoringTeam
}

export interface UndoPointPayload {
  matchId: string
}

export interface MatchScoreSnapshot {
  scoreA: number
  scoreB: number
  sets: number[][]
  currentSetId: number
  server: ScoringTeam | null
}

export interface MatchLastAction {
  type: "point" | "undo"
  team?: ScoringTeam
  timestamp: string
}

export interface MatchEventPayload {
  event: MatchEventType
  matchId: string
  score: MatchScoreSnapshot
  lastAction: MatchLastAction
  status: string
}
