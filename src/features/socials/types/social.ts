import type { PaymentStatus } from "./payment"
import type { PlaySession } from "./play-session"

export type GenderPolicy = "ANY" | "MALE_ONLY" | "FEMALE_ONLY" | "MIXED_ONLY"
export type AgeGroup = "ANY" | "JUNIOR" | "ADULT" | "SENIOR"
export type SocialFormat = "SINGLES" | "SOCIAL"
export type SocialStatus = "PUBLISHED" | "COMPLETED" | "CANCELED" | "DRAFT"
export type HostRole = "HOST_AND_PLAY" | "HOST_ONLY" | "PLAY_ONLY"
export type SocialParticipantStatus =
  | "CONFIRMED"
  | "WAITLISTED"
  | "ON_HOLD"
  | "CANCELLED"

export interface CreateSocialRequest {
  title: string
  note: string
  format: SocialFormat
  startTime: string
  endTime: string
  isFree: boolean
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
  paymentBankName: string | null
  paymentAccountNumber: string | null
  paymentAccountName: string | null
  paymentQrUrl: string | null
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
  joinedCount: number
  status: SocialStatus
  creatorId: string
  createdAt: string
  updatedAt: string
  playSessions: []
  participants: []
}

export interface UpdateSocialRequest {
  title?: string
  note?: string
  format?: SocialFormat
  isFree?: boolean
  minimumLevel?: number | null
  maximumLevel?: number | null
  genderPolicy?: GenderPolicy
  ageGroup?: AgeGroup
  submitDupr?: boolean
  cancellationFreezeHours?: number | null
  autoApproveJoinRequests?: boolean
  totalExpense?: number
  paymentBankName?: string | null
  paymentAccountName?: string | null
  paymentAccountNumber?: string | null
  paymentQrUrl?: string | null
  paymentNote?: string | null
  status?: SocialStatus
  packageFee?: number | null
}

export type SocialFormData = CreateSocialRequest & {
  packageFee?: number | null
  totalExpense?: number
  status?: SocialStatus
}

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  selfRating?: number | null
}

export interface ListSocialRequest {
  page?: number
  limit?: number
  search?: string
  startFrom?: string
  startTo?: string
  upcoming?: boolean
  hasAvailableSlots?: boolean
  minimumLevel?: number
  maximumLevel?: number
  format?: SocialFormat
  genderPolicy?: GenderPolicy
  ageGroup?: AgeGroup
}

export interface ListSocial {
  id: string
  title: string
  note: string
  startTime: string
  endTime: string
  hasAvailableSlots: boolean
  genderPolicy: GenderPolicy
  ageGroup: AgeGroup
  format: SocialFormat
  submitDupr: boolean
  minimumLevel: number | null
  maximumLevel: number | null
  isFree: boolean
  autoApproveJoinRequests: boolean
  hostRole: string
  cancellationFreezeHours: number | null
  joinedCount: number
  status: SocialStatus
  createdAt: string
  updatedAt: string
  creator: User

  _count: {
    participants: number
    playSessions: number
  }

  isHost: boolean
  isParticipant: boolean
  MyParticipantStatus: SocialParticipantStatus
}

export interface ParticipantInfo {
  status: SocialParticipantStatus
  totalFee: number
  amountPaid: number
  amountRefunded: number
  amountDue: number
  amountOverpaid: number
  paymentStatus: PaymentStatus
  joinedSessionIds: string[]
  paymentUrl: string
}

export interface SocialDetail {
  id: string
  title: string
  note: string
  startTime: string
  endTime: string
  totalBookingCost: number
  packageFee: number | null
  totalExpense: number
  paymentBankName: string | null
  paymentAccountName: string | null
  paymentAccountNumber: string | null
  paymentQrUrl: string | null
  paymentNote: string | null
  hasAvailableSlots: boolean
  genderPolicy: GenderPolicy
  ageGroup: AgeGroup
  format: SocialFormat
  submitDupr: boolean
  minimumLevel: number | null
  maximumLevel: number | null
  isPrivate: boolean
  isFree: boolean
  autoApproveJoinRequests: boolean
  hostRole: string
  cancellationFreezeHours: number | null
  maxSlots: number
  joinedCount: 8
  status: SocialStatus
  creatorId: string
  createdAt: string
  updatedAt: string
  creator: User
  _count: {
    participants: number
    playSessions: number
  }
  playSessions: PlaySession[]
  isHost: true
  myParticipantInfo: ParticipantInfo
}

export interface Payment {
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

export interface SocialParticipant {
  id: string
  socialId: string
  userId: string
  status: SocialParticipantStatus
  totalFee: number
  amountPaid: number
  amountRefunded: number
  amountDue: number
  amountOverpaid: number
  isFullPakage: boolean
  paymentStatus: PaymentStatus
  joinedAt: string
  isHost: boolean
  user: User
  payments?: Payment[]
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
