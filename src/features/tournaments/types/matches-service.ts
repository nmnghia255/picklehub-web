import type { MatchType } from "@/features/socials/types/match"

export interface CreateMatchDto {
  category: "SOCIAL" | "TOURNAMENT" | "CUSTOM"
  matchType: MatchType
  scheduledAt?: string
  courtId?: string
  tournamentId?: string
  playSessionId?: string
  teamA: string[] // User IDs
  teamB: string[] // User IDs
  refereeId?: string
}

export interface UpdateMatchDto {
  scheduledAt?: string
  courtId?: string
  teamA?: string[]
  teamB?: string[]
  refereeId?: string
}

export interface ConfirmResultDto {
  winner?: "TEAM_A" | "TEAM_B" | "DRAW"
  scoreA: number
  scoreB: number
  sets?: number[][]
}

export interface MatchQueryDto {
  page?: number
  limit?: number
  userId?: string
  opponentId?: string
  matchType?: "SINGLES" | "DOUBLES" | "PRACTICE"
  category?: "SOCIAL" | "TOURNAMENT" | "CUSTOM"
  status?: "SCHEDULED" | "LIVE" | "PENDING_CONFIRM" | "CONFIRMED" | "CANCELLED"
  tournamentId?: string
  courtId?: string
  playSessionId?: string
  startDate?: string
  endDate?: string
}

export interface MatchStatsResponse {
  totalMatches: number
  wins: number
  losses: number
  draws: number
  winRate: number
}
