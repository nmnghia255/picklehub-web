export type MatchType = "SINGLES" | "DOUBLES" | "PRACTICE" | string

export type MatchStatus =
  | "SCHEDULED"
  | "LIVE"
  | "PENDING_CONFIRM"
  | "CONFIRMED"
  | "CANCELLED"
  | string

export type MatchWinner = "TEAM_A" | "TEAM_B" | "DRAW" | null

export type MatchTimeFilter =
  | "ALL_TIME"
  | "PAST_WEEK"
  | "PAST_MONTH"
  | "THIS_YEAR"

export interface Match {
  id: string
  matchType: MatchType
  status: MatchStatus
  scheduledAt: string
  location: string
  courtId: string | null
  groupId: string | null
  tournamentId: string | null
  scoreA: number
  scoreB: number
  sets: number[][] | null
  winner: MatchWinner
  teamA: string[]
  teamB: string[]
  refereeId: string | null
  confirmedByA: boolean
  confirmedByB: boolean
  confirmedByRef: boolean
  startedAt: string | null
  finishedAt: string | null
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface ScoreUpdate {
  id: string
  matchId: string
  updatedById: string
  scoreA: number
  scoreB: number
  sets: number[][] | null
  note: string | null
  createdAt: string
}

export interface CreateMatchInput {
  matchType: MatchType
  scheduledAt: string
  location: string
  teamA: string[]
  teamB: string[]
  refereeId?: string
  groupId?: string
  tournamentId?: string
}

export interface ListMatchesParams {
  page?: number
  limit?: number
  userId?: string
  opponentId?: string
  timeFilter?: MatchTimeFilter
  matchType?: MatchType
}

export interface MatchesPaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ListMatchesResult {
  message?: string
  data: Match[]
  meta?: MatchesPaginationMeta
}

export interface UserMatchStats {
  totalMatches: number
  wins: number
  losses: number
  draws: number
  winRate: number
}

export interface UpdateLiveScoreInput {
  scoreA: number
  scoreB: number
  sets?: number[][]
  note?: string
}

export interface ConfirmMatchResultInput {
  winner?: Exclude<MatchWinner, null>
}

export interface ApiEnvelope<T> {
  message?: string
  data: T
}
