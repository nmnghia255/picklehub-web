export type MatchStatus =
  | "scheduled"
  | "ready"
  | "in_progress"
  | "completed"
  | "walkover"
  | "pending"

export interface TournamentSchedule {
  id: number
  event: string
  round: string
  team1: Team
  team2: Team
  winner: string | null
  score: string | null
  status: MatchStatus
  court: string
  courtId: string
  courtStatus: string
  externalMatchId: string
  bookingId: string
  bookingItemId: string
  refereeId: string
  refereeName: string
  date: string
  startTime?: string | null
  endTime?: string | null
}

export interface Team {
  teamId: number
  name: string
  seed: number
  rating: number
  player1: Player
  player2: Player
  score: string // only for scheduleFixture api response
}

interface Player {
  id: string
  name: string
  rating: number
  gender: "M" | "F"
  dupr: string
}

export interface TournamentScheduleRequest {
  bookingId: number
  bookingItemId: string
  matchDurationMinutes: number
}

export interface AutoScheduleConfigDto {
  startTime: string
  endTime: string
  matchDurationMinutes: number
  restDurationMinutes: number
  optimizationCriteria: "balanced" | "fastest"
}

export interface PreviewAssignment {
  matchId: number
  round: string
  team1Name?: string
  team2Name?: string
  courtName: string // API returns the court GUID in this field
  date: string // e.g. "2026-07-25"
  startTime: string // e.g. "10:30"
  endTime: string // e.g. "11:00"
  bookingId: number
  bookingItemId: string
}

export interface AutoSchedulePreviewResponse {
  expectedCompletionTime: string
  scheduledMatchesCount: number
  totalCourtsUsed: number
  warnings: string[]
  previewAssignments: PreviewAssignment[]
}

export interface FixtureResultRequest {
  winnerId?: number | null
  score?: string | null
  status?: string
  sets?: { score1: number; score2: number }[]
}

export interface ConfirmAutoScheduleRequest {
  assignments: PreviewAssignment[]
}
