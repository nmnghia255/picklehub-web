// Updated Types – full definitions with // new: annotations for differences

export interface Tournament {
  id: number
  uuid: string // new: UUID for external references
  organizerId: string | null // new: organizer reference
  name: string
  venue: string
  startDate: string
  endDate: string
  registered: number
  capacity: number
  status: TournamentStatus
  banner: string | null // new: banner can be null
  description: string | null // new
  registrationStartDate: string | null // new
  registrationEndDate: string | null // new
  paymentBankName: string | null // new
  paymentAccountName: string | null // new
  paymentAccountNumber: string | null // new
  paymentQrUrl: string | null // new
  paymentNote: string | null // new
  centerIds: string[] // new
  createdAt: string // new: creation timestamp
  updatedAt: string // new: last update timestamp
}

export type EventFormat =
  | "single_elimination"
  | "double_elimination"
  | "round_robin" // new

export interface TournamentEvent {
  id: number
  name: string
  type: "Singles" | "Doubles" | "Team"
  skillRange: string
  gender: "Men" | "Women" | "Mixed" // (still present)
  participants: number
  capacity: number
  entryFee: number
  status: EventStatus
  format: EventFormat // new
  tournamentId: number // new: link to parent tournament
}

export interface Player {
  id?: string // new: changed from number to string (UUID)
  name: string
  rating: number
  avatar?: string
  age?: number
  gender?: string // new: free‑form string instead of fixed enum
  duprId?: string | null // new: DUPR rating identifier
}

export interface Team {
  id: number
  tournamentId: number // new: link to tournament
  eventId: number // new: link to event
  player1: Player
  player2: Player | null // new: explicit nullable partner (was optional Player)
  avgRating: number | null // new: nullable average rating (was optional number)
  // matchScore field removed
}

export interface Registration {
  id: number
  tournamentId: number // new: link to tournament
  eventId: number // new: link to event
  player: Player
  partner: Player | null // new: explicit nullable partner (was optional)
  event: string
  paymentStatus: string // new: expanded status string (was enum)
  paymentProofUrl: string | null // new: optional proof URL
  paymentProofUploadedAt: string | null // new: optional proof timestamp
  status: RegistrationStatus
  registrationDate: string
}

export interface MatchTeam {
  teamId: number // new: team identifier
  name: string
  seed: number | null // new: nullable seed (was optional)
  rating: number | null // new: nullable rating (was optional)
  score?: number
}

export interface MatchWarning {
  type: "player_conflict" | "rest_time" | "court_conflict"
  message: string
}

export interface Match {
  id: number // changed: now always number (was number|string)
  tournamentId: number // new: reference to tournament
  eventId: number // new: reference to event
  event: string | null // new: event name
  round: string | null // still nullable
  team1Id: number | null // new: reference to team 1
  team1: MatchTeam | null // new: nested Team 1 view
  team2Id: number | null // new: reference to team 2
  team2: MatchTeam | null // new: nested Team 2 view
  winner: number | null
  score: string | null
  status: string // changed: now generic string
  court: string | null // new: court name
  courtId: string | null // new: reference to court
  courtStatus: string | null // new: status of the court
  time: string | null
  startTime: string | null
  duration: number | null
  priority: string | null // now generic string
  refereeId: string | null // new: referee identifier
  refereeName: string | null // new: referee name
  externalMatchId: string | null // new: reference to match in match-service
  bracketPosition: number | null // new
  nextMatchId: number | null // new
  loserMatchId: number | null // new
  stage: string | null // new
  bookingId: number | null // new
  bookingItemId: string | null // new
}

export interface Seed {
  seed: number
  team: string
  rating: number
  wins: number
  losses: number
  status: "locked" | "unlocked"
}

export interface Court {
  id: number
  name: string
  status: CourtStatus
  match: string | null
  timeRemaining: string | null
}

export interface Announcement {
  id: number
  message: string
  time: string
  type: "info" | "update" | "warning"
}

export interface DashboardStat {
  label: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
}

export interface RecentActivity {
  id: number
  type: "registration" | "match" | "payment" | "update"
  message: string
  time: string
}

export interface FinancialTransaction {
  id: number
  tournamentId: number // new: reference to tournament
  date: string
  description: string
  type: "income" | "expense" | "refund"
  amount: number
  status: string // new: generic string for status
}

// New interfaces added in the latest version
export interface CheckIn {
  // new: interface for check‑in tracking
  id: number
  tournamentId: number
  registrationId: number
  player1CheckedIn: boolean
  player1CheckedInAt: string | null
  player2CheckedIn: boolean
  player2CheckedInAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Sponsor {
  // new: interface for sponsor information
  id: number
  tournamentId: number
  name: string
  logoUrl: string | null
  amount: number
  websiteUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface Prize {
  // new: interface for prize details
  id: number
  tournamentId: number
  eventId: number | null
  name: string
  rewardType: string
  value: number
  description: string | null
  winnerTeamId: number | null
  createdAt: string
  updatedAt: string
}

// Helper type definitions
export type PaymentStatus = "pending" | "verifying" | "completed"
export type TransactionStatus = "pending" | "verifying" | "completed" // new

// ─── Live Score Types (match-service WebSocket) ──────────────────────────────
// new: All types below support the real-time Live Score feature via WebSocket

export type ScoringTeam = "TEAM_A" | "TEAM_B" // new: identifies which team scored
export type WinnerTeam = "TEAM_A" | "TEAM_B" | "DRAW" // new: match outcome
export type MatchEventType = "point-scored" | "point-undone" | "match-completed" // new: WS broadcast event types

export interface MatchScoreHistory {
  // new: audit trail for every scored point
  id: string // UUID
  matchId: string // UUID — reference to Match in match-service
  setId: number // 1-based set index (1, 2, or 3)
  scoringTeam: ScoringTeam
  pointType: string // default: 'NORMAL'
  timestamp: string // ISO datetime
}

/** WebSocket input: Referee sends to score a point (event: 'score-point') */
export interface ScorePointPayload {
  // new: WS input DTO
  matchId: string // UUID
  setId: number // 1–3
  scoringTeam: ScoringTeam
}

/** WebSocket input: Referee sends to undo the last point (event: 'undo-point') */
export interface UndoPointPayload {
  // new: WS input DTO
  matchId: string // UUID
}

/** Score snapshot included in every broadcast */
export interface MatchScoreSnapshot {
  // new: embedded in WS broadcast
  scoreA: number // set wins for Team A
  scoreB: number // set wins for Team B
  sets: number[][] // e.g. [[11,5],[9,11],[11,8]]
  currentSetId: number // which set is currently active
  server: ScoringTeam | null // last scoring team, null on undo
}

/** Last action metadata in broadcast */
export interface MatchLastAction {
  // new: embedded in WS broadcast
  type: "point" | "undo"
  team?: ScoringTeam // present only when type = 'point'
  timestamp: string // ISO datetime
}

/** WebSocket broadcast payload (event: 'match-event') sent to room subscribers */
export interface MatchEventPayload {
  // new: full WS broadcast shape
  event: MatchEventType
  matchId: string
  score: MatchScoreSnapshot
  lastAction: MatchLastAction
  status: string // 'LIVE' | 'CONFIRMED' | etc.
}

export interface AuditLog {
  // new
  id: number
  action: string // e.g. "STATUS_CHANGE", "INFO_UPDATE", "TOURNAMENT_DELETE"
  oldValue: Record<string, unknown> | null
  newValue: Record<string, unknown> | null
  createdAt: string // ISO datetime
  tournamentId: number | null
}

export interface TournamentBooking {
  // new
  id: number
  tournamentId: number
  externalBookingId: string // UUID
  centerId: string // UUID
  date: string | null
  statusMirror: string // "PENDING" | "CONFIRMED" | "CANCELLED" etc.
  totalPrice: number | null
  createdAt: string // ISO datetime
  updatedAt: string // ISO datetime
}

type TournamentStatus = unknown
type EventStatus = unknown
type RegistrationStatus = unknown
type CourtStatus = unknown
