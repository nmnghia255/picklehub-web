import type { EnrollmentStatus, PaymentStatus } from "../coach"

// GET /api/learner/class-enrollments response item
export interface EnrollmentListItemDTO {
  id: string
  classId: string
  learnerId: string
  status: EnrollmentStatus
  paymentStatus: PaymentStatus
  amountVnd: number
  paymentProofUrl: string | null
  proofUploadedAt: string | null
  settledAt: string | null
  enrolledAt: string
  cancelledAt: string | null
  learnerProfile: {
    id: string
    name: string
    email: string
    role: string
    avatarUrl: string
  }
  coachClass: {
    id: string
    title: string
    level: string
    priceVnd: number
    locationDescription: string
    coverImageUrl: string
    status: string
    coachProfile: {
      id: string
      displayName: string
      avatarUrl: string
      paymentAccountName: string
      paymentAccountNumber: string
      paymentBankName: string
      paymentQrUrl: string
    }
    schedules?: Array<{
      id: string
      scheduledAt: string
      durationMinutes: number
      topic: string
    }>
  }
}

// POST /api/classes/{classId}/enroll response
export interface EnrollmentCreateDTO {
  id: string
  classId: string
  learnerId: string
  status: EnrollmentStatus
  paymentStatus: PaymentStatus
  amountVnd: number
  paymentProofUrl: string | null
  proofUploadedAt: string | null
  settledAt: string | null
  enrolledAt: string
  cancelledAt: string | null
  learnerProfile: {
    id: string
    name: string
    email: string
    role: string
    avatarUrl: string
  }
  coachPaymentInfo: {
    paymentAccountName: string
    paymentAccountNumber: string
    paymentBankName: string
    paymentQrUrl: string
  }
}
