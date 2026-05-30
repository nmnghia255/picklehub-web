export type GenderPolicy =
  | "ANY"
  | "MALE_ONLY"
  | "FEMALE_ONLY"
  | "MIXED_ONLY"
export type AgeGroup = "ANY" | "JUNIOR" | "ADULT" | "SENIOR"
export type SocialFormat = "SOCIAL" | "SINGLES"
export type SocialStatus = "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED"
export type HostRole = "HOST_ONLY" | "HOST_AND_PLAY"
export type ParticipantStatus =
  | "CONFIRMED"
  | "WAITLISTED"
  | "ON_HOLD"
  | "CANCELLED"
export type SocialPaymentStatus = "UNPAID" | "PENDING_REVIEW" | "PAID"
export type PlaySessionStatus = "ACTIVE" | "CANCELLED"

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
  joinedCount: number
  maxSlots?: number
  bookingIds: string[]
  numberOfCourts: number
  courtNames?: string | null
  location?: string | null
  sessionFee: number
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
  status: ParticipantStatus
  joinedAt: string
  isHost?: boolean
  paymentStatus?: SocialPaymentStatus
  totalFee?: number
  paymentReceiptUrl?: string | null
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
  status: ParticipantStatus
  joinedAt: string
  isHost?: boolean
  paymentStatus?: SocialPaymentStatus
  totalFee?: number
  paymentReceiptUrl?: string | null
}

export interface Social {
  id: string
  title: string
  note: string | null
  groupId: string | null
  startTime: string | null
  endTime: string | null
  totalBookingCost: number
  discountedPackageFee: number
  totalExpense: number
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
  cancellationFreezeHours: number | null
  maxSlots: number
  joinedCount: number
  status: SocialStatus
  creatorId: string
  createdAt: string
  updatedAt: string
  organizers?: Array<{ userId: string }>
  participants?: Participant[]
  playSessions?: PlaySession[]
  isHost?: boolean
  isParticipant?: boolean
  MyParticipantStatus?: ParticipantStatus | null
  _count?: {
    participants: number
    playSessions: number
  }
}
