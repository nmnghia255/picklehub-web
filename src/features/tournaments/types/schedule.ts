export interface TournamentSchedule {
  id: number
  event: string
  round: string
  team1: Team
  team2: Team
  winner: null
  score: null
  status: string
  court: string
  courtId: string
  courtStatus: string
  externalMatchId: string
  bookingId: string
  bookingItemId: string
}

interface Team {
  teamId: number
  name: string
  seed: number
  rating: number
  score: null
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
  courtIds: string[]
}

export interface PreviewAssignment {
  matchId: number
  courtId: string
  courtName: string
  scheduledStartTime: string // ISO date string
  scheduledEndTime: string // ISO date string
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
