export interface RefereeRequest {
  refereeId: string
  refereeName: string
  refereeEmail: string
  refereeAvatar: string
  phone: string
}

export interface Referee extends RefereeRequest {
  id: number
  enrolledAt: string
  workload: number
}

export interface AssignedReferee {
  id: string
  tournamentId: string
  eventId: string
  round: string
  team1Id: string
  team2Id: string
  winner: string
  score: string
  status: string
  courtId: string
  time: string
  startTime: string
  duration: number
  priority: string
  refereeId: string
  refereeName: string
  externalMatchId?: string | null
  event: {
    name: string
    type: string
  }
  court: {
    name: string
  }
}

export interface InviteRefereeDto {
  email: string
}

export interface InviteRefereeResponseDto {
  id: number
  email: string
  token: string
  tournamentId: number
  status: string
  sentAt: string
  expiresAt: string
}

export interface RefereeInvitationItemDto {
  id: number
  email: string
  status: "PENDING" | "ACCEPTED" | "REVOKED"
  expiresAt: string
  createdAt: string
  revokedAt?: string | null
}

export interface RevokeInvitationResponseDto {
  id: number
  status: "REVOKED"
  revokedAt: string
}

export interface RefereeInvitationMetadataDto {
  id?: number
  email: string
  tournamentId: number
  tournamentName?: string
  status: string
  expiresAt?: string
}

export interface AcceptInvitationResponseDto {
  accessToken?: string
  userId?: string
  email?: string
  tournamentId?: number
  status?: string
}

export interface JoinTournamentResponseDto {
  referee?: Referee
  success?: boolean
}
