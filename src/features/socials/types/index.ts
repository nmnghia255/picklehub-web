export type GenderPolicy = "MALE_ONLY" | "FEMALE_ONLY" | "MIXED"
export type AgeGroup = "JUNIOR" | "ADULT" | "SENIOR"
export type SocialFormat = "SOCIAL" | "TOURNAMENT" | "TRAINING"
export type SocialStatus = "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED"
export type HostRole = "HOST_ONLY" | "HOST_AND_PLAY"
export type ParticipantStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "REJECTED"
export type PlaySessionStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "COMPLETED"
  | "CANCELLED"

export interface User {
  id: string
  name: string
  avatar?: string
  email: string
}

export interface PlaySession {
  id: string
  title: string
  status: PlaySessionStatus
  maxSlots: number
  joinedCount: number
  startTime: string
  endTime: string
  creatorId: string
  socialId: string
  participants?: SessionParticipant[]
  matches?: Match[]
}

export interface SessionParticipant {
  id: string
  userId: string
  user: User
  status: ParticipantStatus
  joinedAt: string
  skillLevel?: number
}

export type MatchStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"

export interface Match {
  id: string
  playSessionId: string
  courtNumber?: number
  status: MatchStatus
  startTime?: string
  endTime?: string
  team1: {
    player1: User
    player2?: User
  }
  team2: {
    player1: User
    player2?: User
  }
  score?: {
    team1Score: number
    team2Score: number
  }
}

export interface Participant {
  id: string
  userId: string
  user: User
  status: ParticipantStatus
  joinedAt: string
}

export interface Social {
  id: string
  title: string
  note: string
  groupId: string
  startTime: string
  endTime: string
  totalExpense?: number
  paymentQrUrl?: string
  paymentCode?: string
  paymentNote?: string
  hasAvailableSlots: boolean
  genderPolicy: GenderPolicy
  ageGroup: AgeGroup
  format: SocialFormat
  submitDupr: boolean
  minimumLevel?: number
  maximumLevel?: number
  isPrivate: boolean
  autoApproveJoinRequests: boolean
  hostRole: HostRole
  cancellationFreezeHours: number
  maxSlots: number
  joinedCount: number
  status: SocialStatus
  creatorId: string
  createdAt: string
  updatedAt: string
  organizers: User[]
  participants: Participant[]
  playSessions: PlaySession[]
  isHost?: boolean
  isParticipant?: boolean
  myParticipantStatus?: ParticipantStatus
}
