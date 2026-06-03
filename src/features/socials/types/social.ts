import type { PlaySession } from "./play-session"

export type GenderPolicy = "ANY" | "MALE_ONLY" | "FEMALE_ONLY" | "MIXED"
export type AgeGroup = "ANY" | "JUNIOR" | "ADULT" | "SENIOR"
export type SocialFormat = "SINGLE" | "SOCIAL"
export type SocialStatus = "PUBLISHED" | "COMPLETED" | "CANCELED"

export interface CreateSocialResponse {
  id: string
  title: string
  note: string
  groupId: null
  startTime: string
  endTime: string
  totalBookingCost: number
  discountedPackageFee: number
  totalExpense: number
  paymentQrUrl: string | null
  paymentCode: string | null
  paymentNote: string | null
  hasAvailableSlots: boolean
  genderPolicy: GenderPolicy
  ageGroup: AgeGroup
  format: string
  submitDupr: boolean
  minimumLevel: null
  maximumLevel: null
  isPrivate: false
  autoApproveJoinRequests: true
  hostRole: string
  cancellationFreezeHours: null
  maxSlots: number
  joinedCount: number
  status: SocialStatus
  creatorId: string
  createdAt: string
  updatedAt: string
  playSessions: PlaySession[]
  participants: SocialParticipant[]
}

export interface ListSocialResponse {
  id: string
  title: string
  note: string
  groupId: null
  startTime: string
  endTime: string
  totalBookingCost: number
  discountedPackageFee: number
  totalExpense: number
  paymentQrUrl: string | null
  paymentCode: string | null
  paymentNote: string | null
  hasAvailableSlots: boolean
  genderPolicy: GenderPolicy
  ageGroup: AgeGroup
  format: string
  submitDupr: boolean
  minimumLevel: string
  maximumLevel: string
  isPrivate: boolean
  autoApproveJoinRequests: boolean
  hostRole: string
  cancellationFreezeHours: null
  maxSlots: number
  joinedCount: number
  status: SocialStatus
  creatorId: string
  createdAt: string
  updatedAt: string

  _count: {
    participants: number
    playSessions: number
  }
  organizers: [
    {
      userId: string
    },
  ]
  participants: [
    {
      userId: string
      status: string
    },
  ]
  isHost: boolean
  isParticipant: boolean
  MyParticipantStatus: string
}

export interface SocialParticipant {
  id: string
  socialId: string
  userId: string
  status: string
  totalFee: number
  paymentReceiptUrl: string | null
  paymentStatus: string
  joinedAt: string
  isHost: boolean
}

export interface DuplicateSessionRequest {
  title: string
  startTime: string
  endTime: string
  bookingIds: string[]
}

export interface LeaveSocialResponse {
  socialId: string
  userId: string
  promotedUserId: string
}
