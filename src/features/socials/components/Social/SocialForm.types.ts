import type {
  AgeGroup,
  GenderPolicy,
  HostRole,
  SocialFormat,
  SocialStatus,
} from "../../types"

export interface SocialFormData {
  groupId: string
  title: string
  note: string
  format: SocialFormat
  startTime: string
  endTime: string
  genderPolicy: GenderPolicy
  ageGroup: AgeGroup
  minimumLevel: number
  maximumLevel: number
  maxSlots: number
  hostRole: HostRole
  isPrivate: boolean
  autoApproveJoinRequests: boolean
  submitDupr: boolean
  cancellationFreezeHours: number
  totalExpense: number
  paymentQrUrl: string
  paymentCode: string
  paymentNote: string
  status: SocialStatus
}

export interface PlaySessionDraft {
  title: string
  startTime: string
  endTime: string
  maxSlots: number
}
