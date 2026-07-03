export interface TournamentSchedule {
  id: number
  event: string
  round: string
  team1: Team
  team2: Team
  winner: string | null
  score: string | null
  status: string
  court: string
  courtId: string
  courtStatus: string
  externalMatchId: string
  bookingId: string
  bookingItemId: string
  refereeId: string
  refereeName: string
}

interface Team {
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
}

export interface AutoScheduleConfigDto {
  startTime: string
  endTime: string
  matchDurationMinutes: number
  restDurationMinutes: number
  minBreakBetweenMatchesMinutes: number
  optimizationCriteria: "fastest" | "balanced" | "max_rest"
}

export interface PreviewAssignment {
  matchId: number
  round?: string
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
  projectedCompletedAt: string
  scheduledMatchesCount: number
  courtsUsedCount: number
  previewAssignments: PreviewAssignment[]
}

export interface FixtureResultRequest {
  winnerId?: number | null
  score?: string | null
  status?: string
  sets?: { score1: number; score2: number }[]
}
