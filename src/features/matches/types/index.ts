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

export interface MatchUser {
  id: string
  fullName: string
  avatarUrl?: string | null
  selfRating?: number | null
}

export interface MatchCourt {
  id: string
  name: string
  type: string
  status: string
  centerId: string
  centerName: string
  centerAddress: string
}

export interface Match {
  id: string
  category?: string
  matchType: MatchType
  status: MatchStatus
  scheduledAt: string
  location?: string | null
  courtId: string | null
  court?: MatchCourt | null
  groupId: string | null
  tournamentId: string | null
  playSessionId?: string | null
  scoreA: number
  scoreB: number
  sets: number[][] | null
  winner: MatchWinner
  teamA: (string | MatchUser)[]
  teamB: (string | MatchUser)[]
  refereeId: string | null
  referee?: MatchUser | null
  confirmedByA: boolean
  confirmedByB: boolean
  confirmedByRef: boolean
  startedAt: string | null
  finishedAt: string | null
  createdById: string
  createdBy?: MatchUser | null
  createdAt: string
  updatedAt: string
  /** Number of total sets in the match format (1, 3, or 5). Added by match-service v2. */
  bestOfSets?: 1 | 3 | 5 | null
  /** Points needed to win a single set (11, 15, or 21). Added by match-service v2. */
  pointsToWin?: 11 | 15 | 21 | null
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
  category?: "SOCIAL" | "TOURNAMENT" | "CUSTOM" | string
  matchType: MatchType
  scheduledAt: string
  location?: string
  courtId?: string
  teamA: string[]
  teamB: string[]
  refereeId?: string
  groupId?: string
  tournamentId?: string
  playSessionId?: string
}

export interface UpdateMatchInput {
  scheduledAt?: string
  courtId?: string
  teamA?: string[]
  teamB?: string[]
  refereeId?: string
  location?: string
  category?: string
  matchType?: MatchType
}

export interface ListMatchesParams {
  page?: number
  limit?: number
  userId?: string
  opponentId?: string
  timeFilter?: MatchTimeFilter
  matchType?: MatchType
  category?: string
  status?: MatchStatus
  tournamentId?: string
  courtId?: string
  playSessionId?: string
  startDate?: string
  endDate?: string
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
  scoreA?: number
  scoreB?: number
  sets?: number[][] | null
}

export interface ApiEnvelope<T> {
  message?: string
  data: T
}
