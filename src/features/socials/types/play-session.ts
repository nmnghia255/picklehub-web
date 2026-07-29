import type { TransactionStatus } from "./payment"

export type PlaySessionStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "IN_PROGRESS "
  | "CANCELLED"

export interface PlaySessionCourt {
  id: string
  name: string
  centerName?: string | null
}

export interface PlaySession {
  id: string
  title: string
  socialId: string
  bookingIds: string[]
  joinedCount: number | null
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
  maxSlot: number | null
  isHost: boolean
  creatorId: string
  createdAt: string
  updatedAt: string
  courts?: PlaySessionCourt[]
  participants?: PlaySessionParticipant[]
}

export interface PlaySessionRequest {
  title: string
  startTime: string
  endTime: string
  sessionFee: number
  maxSlot: number
  bookingIds?: string[]
}

export interface ParticipantPayment {
  id: string
  socialParticipantId: string
  amount: number
  receiptUrl: string | null
  status: TransactionStatus
  transactionType?: string
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
