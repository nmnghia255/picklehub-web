import type { ClassStatus, CoachLevel, VerificationStatus } from "../coach"

export interface DiscoverClassItemModel {
  id: string
  title: string
  description: string
  level: CoachLevel
  capacity: number
  enrolledCount: number
  priceVnd: number
  locationDescription: string
  coverImageUrl: string
  status: ClassStatus
  startDate: string
  endDate: string
  schedules: {
    id: string
    scheduledAt: string
    durationMinutes: number
    topic: string
  }[]
  coachProfile: {
    displayName: string
    avatarUrl: string
    verificationStatus: VerificationStatus
    locationCity: string
    paymentAccountName: string
    paymentAccountNumber: string
    paymentBankName: string
    paymentQrUrl: string
  }
}
