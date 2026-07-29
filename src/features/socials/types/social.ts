import type { PaymentStatus } from "./payment"
import type { PlaySession } from "./play-session"

export type GenderPolicy = "ANY" | "MALE_ONLY" | "FEMALE_ONLY" | "MIXED_ONLY"
export type AgeGroup = "ANY" | "JUNIOR" | "ADULT" | "SENIOR"
export type SocialFormat = "SINGLES" | "SOCIAL"
export type SocialStatus =
  | "PUBLISHED"
  | "COMPLETED"
  | "CANCELED"
  | "CANCELLED"
  | "DRAFT"
export type HostRole = "HOST_AND_PLAY" | "HOST_ONLY" | "PLAY_ONLY"
export type SocialParticipantStatus = "CONFIRMED" | "WAITLISTED" | "CANCELLED"

export interface CreateSocialRequest {
  title: string
  note: string
  format: SocialFormat
  startTime: string
  endTime: string
  isFree: boolean
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
  bookingIds: string[]
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
  bookingIds?: string[]
}

export type SocialFormData = CreateSocialRequest & {
  packageFee?: number | null
  totalExpense?: number
  status?: SocialStatus
  bookingIds: string[]
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
  id?: string
  status: SocialParticipantStatus
  totalFee: number
  amountPaid: number
  amountRefunded: number
  amountDue: number
  amountOverpaid: number
  paymentStatus: PaymentStatus
  joinedAt?: string
  joinedSessionIds: string[]
  paymentUrl: string | null
}

export interface CourtScheduleItem {
  courtId: string
  courtName: string
  startTime: string
  endTime: string
}

export interface SocialBookingItem {
  id: string
  centerId?: string
  centerName?: string
  location?: string
  courtName: string
  startTime: string
  endTime: string
  price?: number
  status?: string
}

export interface SocialDetail {
  id: string
  title: string
  note: string
  startTime: string
  endTime: string
  bookingIds?: string[]
  centerId?: string | null
  centerName?: string | null
  location?: string | null
  numberOfCourts?: number
  courtNames?: string | null
  courtSchedule?: CourtScheduleItem[]
  bookings?: SocialBookingItem[]
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
  isFree: boolean
  isPrivate?: boolean
  autoApproveJoinRequests: boolean
  hostRole: string
  cancellationFreezeHours: number | null
  maxSlots: number
  joinedCount: number
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
  isHost: boolean
  myParticipantInfo: ParticipantInfo
}

export interface Payment {
  id: string
  socialParticipantId: string
  amount: number
  receiptUrl: string | null
  status: PaymentStatus
  transactionType?: string
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
  paymentStatus: PaymentStatus
  joinedAt: string
  isHost: boolean
  user: User
  receiptUrls?: string[]
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

// ──────────────────────────────────────────────
// Social Invitation System
// ──────────────────────────────────────────────

export type SocialInvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "EXPIRED"
  | "CANCELLED"

export interface SocialInvitation {
  id: string
  socialId: string
  inviterId: string
  inviteeId?: string | null
  inviteCode?: string | null
  status: SocialInvitationStatus
  expiresAt?: string | null
  createdAt: string
  updatedAt: string
  invitee?: {
    id: string
    fullName: string
    avatarUrl?: string
  } | null
}

export interface InvitationLinkData {
  inviteCode: string
  /** Relative path, e.g. /socials/:id?inviteCode=soc_xyz */
  shareUrl: string
}

export interface InviteCodePreview {
  id: string
  socialId: string
  inviteCode: string
  status: SocialInvitationStatus
  social?: {
    id: string
    title: string
    startTime?: string
    endTime?: string
    format: string
    joinedCount: number
    hasAvailableSlots: boolean
  } | null
}

export interface CreateInvitationResult {
  createdCount: number
  skippedCount: number
  totalRequested: number
}
