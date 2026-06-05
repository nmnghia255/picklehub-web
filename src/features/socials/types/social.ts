import type { PlaySession } from "./play-session"

export type GenderPolicy = "ANY" | "MALE_ONLY" | "FEMALE_ONLY" | "MIXED"
export type AgeGroup = "ANY" | "JUNIOR" | "ADULT" | "SENIOR"
export type SocialFormat = "SINGLE" | "SOCIAL"
export type SocialStatus = "PUBLISHED" | "COMPLETED" | "CANCELED"
export type HostRole = "HOST_AND_PLAY" | "HOST_ONLY" | "PLAY_ONLY"

export interface CreateSocialRequest {
  groupId: string | null
  title: string
  note: string
  startTime: string
  endTime: string
  format: SocialFormat
  isPrivate: boolean
  maxSlots: number
  submitDupr: boolean
  minimumLevel: number | null
  maximumLevel: number | null
  genderPolicy: GenderPolicy
  ageGroup: AgeGroup
  hostRole: string
  cancellationFreezeHours: number | null
  autoApproveJoinRequests: boolean
  paymentQrUrl: string | null
  paymentCode: string | null
  paymentNote: string | null
}

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
  minimumLevel: number | null
  maximumLevel: number | null
  isPrivate: false
  autoApproveJoinRequests: true
  hostRole: string
  cancellationFreezeHours: number | null
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
  groupId: string | null
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
  format: SocialFormat
  submitDupr: boolean
  minimumLevel: number | null
  maximumLevel: number | null
  isPrivate: boolean
  autoApproveJoinRequests: boolean
  hostRole: string
  cancellationFreezeHours: number | null
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

export type SocialParticipantStatus =
  | "CONFIRMED"
  | "WAITLISTED"
  | "ON_HOLD"
  | "CANCELLED"
export type PaymentStatus = "PAID" | "PENDING" | "FAILED"

export interface SocialParticipant {
  id: string
  socialId: string
  userId: string
  status: SocialParticipantStatus
  totalFee: number
  paymentReceiptUrl: string | null
  paymentStatus: string
  joinedAt: string
  isHost: boolean
  name: string
  avatarUrl: string | null
  selfRating: number | null
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

export interface Host {
  id: string
  name: string
  avatarUrl?: string | null
}
