export type Gender = "MALE" | "FEMALE"
export type MatchType = "SINGLES" | "DOUBLES"

export interface SuggestedMatchRequest {
  singlesCount: number
  doublesCount: number
  roundDurationMins: number
  excludeParticipantIds: string[]
}

export interface UserSummary {
  id: string
  fullName: string
  avatarUrl: string | null
  gender: Gender
  selfRating: number
}

export interface MatchParticipant {
  participantId: string
  userId: string
  user: UserSummary
}

export interface SuggestedMatch {
  courtNumber: number
  courtId: string
  courtName: string
  bookingId: string
  scheduledAt: string
  matchType: MatchType
  teamA: MatchParticipant[]
  teamB: MatchParticipant[]
  isUnrated: boolean
}

export interface AvailableCourt {
  courtNumber: number
  courtId: string
  courtName: string
  bookingId: string
}

export interface SuggestedRound {
  roundIndex: number
  scheduledAt: string
  availableCourts: AvailableCourt[]
  matches: SuggestedMatch[]
  waitingParticipants: MatchParticipant[]
}

export interface SuggestedMatchBatchResponse {
  sessionStartTime: string
  rounds: SuggestedRound[]
}

export interface CommitMatchRequest {
  courtId: string
  scheduledAt: string
  matchType: MatchType
  category: string
  teamA: string[]
  teamB: string[]
  refereeId: string | null
}

export interface TeamPlayer {
  id: string
  name: string
}

export interface CreatedMatch {
  id: string
  category: string
  matchType: MatchType
  status: string
  scheduledAt: string
  courtId: string
  playSessionId: string
  teamA: TeamPlayer[]
  teamB: TeamPlayer[]
}

export interface CommitMatchBatchResponse {
  created: number
  matches: CreatedMatch[]
}

export interface Player {
  id: string
  name: string
  skillLevel?: number
  avatarUrl?: string | null
}

export interface Match {
  id: string
  courtId: string
  sessionIndex: number
  matchType: MatchType
  players: Array<Player | null>
}

export interface PlaySessionMatchTeamPlayer {
  id: string
  fullName?: string
  avatarUrl?: string | null
  selfRating?: number | null
}

export interface PlaySessionMatchCreator {
  id: string
  fullName: string
  avatarUrl: string | null
  selfRating: number | null
  email?: string
  name?: string
  bio?: string | null
  gender?: string
  preferredHand?: string | null
  phoneNumber?: string | null
  address?: string | null
  dupr?: number | null
}

export interface PlaySessionMatchReferee {
  id: string
  fullName: string
  avatarUrl: string | null
  selfRating: number | null
}

export interface PlaySessionMatchCourt {
  id: string
  name: string
  type: string
  status: string
  centerId: string
  centerName: string
  centerAddress: string
}

export interface PlaySessionMatch {
  id: string
  category: string
  matchType: MatchType
  status: string
  scheduledAt: string
  courtId: string
  tournamentId: string | null
  playSessionId: string | null
  scoreA: number
  scoreB: number
  sets: number[][] | null
  winner: string | null
  teamA: PlaySessionMatchTeamPlayer[]
  teamB: PlaySessionMatchTeamPlayer[]
  refereeId: string | null
  confirmedByA: boolean
  confirmedByB: boolean
  confirmedByRef: boolean
  startedAt: string | null
  finishedAt: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  referee: PlaySessionMatchReferee | null
  createdBy: PlaySessionMatchCreator
  court: PlaySessionMatchCourt
}

export interface ListPlaySessionMatchesResponse {
  items: PlaySessionMatch[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface PlaySessionCardMatch {
  id: string
  playSessionId: string | null
  courtNumber?: number
  courtName?: string
  status: string
  startTime?: string | null
  endTime?: string | null
  startedAt?: string | null
  scheduledAt?: string | null
  team1: {
    player1: { id: string; name: string; avatar?: string | null } | null
    player2?: { id: string; name: string; avatar?: string | null } | null
  }
  team2: {
    player1: { id: string; name: string; avatar?: string | null } | null
    player2?: { id: string; name: string; avatar?: string | null } | null
  }
  score?: {
    team1Score: number
    team2Score: number
  } | null
  sets?: number[][] | null
  winner?: string | null
  refereeId?: string | null
}
