import type { PaymentStatus } from "./payment"

export interface PlaySession {
  id: string
  title: string
  socialId: string
  bookingIds: string[]
  joinedCount: number
  numberOfCourts: number
  courtNames: string[]
  courtSchedule: string | null
  location: string
  centerId: string | null
  centerName: string | null
  sessionFee: number
  pricePerPlayer: number
  startTime: string
  endTime: string
  status: string
  maxSlot: number
  isHost: boolean
  creatorId: string
  createdAt: string
  updatedAt: string
}

export interface PlaySessionRequest {
  title: string
  bookingIds: string[]
  sessionFee: number
  maxSlot: number
}

export interface ParticipantPayment {
  id: string
  socialParticipantId: string
  amount: number
  receiptUrl: string | null
  status: PaymentStatus
  transactionType: string
  createdById: string
  verifiedById: string
  createdAt: string
  updatedAt: string
}

export interface PlaySessionParticipant {
  id: string
  playSessionId: string
  userId: string
  status: string
  isHost: boolean
  guestName: string | null
  skillLevel: number | null
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
    role: string
  }
  payments: ParticipantPayment[]
}

interface Session {
  id: string
  socialId: string
  status: string
  updatedAt: string
}

export interface StartPlaySessionResponse {
  session: Session
  seededParticipants: number
}

export interface CompletePlaySessionResponse {
  session: Session
  socialCascadedToCompleted: boolean
}
