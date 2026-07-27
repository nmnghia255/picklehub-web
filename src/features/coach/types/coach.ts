export interface CoachProfileSummary {
  id: string
  userId: string
  displayName: string
  avatarUrl: string
  level: CoachLevel
  yearsExperience: number
  specialties: string[]
  languages: string[]
  locationCity: string
  hourlyRateVnd: number
  verificationStatus: VerificationStatus
  createdAt: string
  averageRating: number
  reviewCount: number
}

export interface CoachProfile {
  id: string
  userId: string
  displayName: string
  bio: string
  avatarUrl: string
  level: CoachLevel
  yearsExperience: number
  specialties: string[]
  languages: string[]
  locationCity: string
  hourlyRateVnd: number
  paymentAccountName: string
  paymentAccountNumber: string
  paymentBankName: string
  paymentQrUrl: string
  status: CoachStatus
  verificationStatus: VerificationStatus
  createdAt: string
  updatedAt: string
  certifications: Certification[]
  averageRating: number
  reviewCount: number
}

export type CoachLevel = "Beginner" | "Intermediate" | "Advanced" | "Pro"
export type CoachStatus = "DRAFT" | "ACTIVE" | "SUSPENDED"
export type VerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"

export interface Certification {
  id: string
  coachProfileId: string
  name: string
  issuingOrganization: string
  issuedAt: string
  expiresAt: string | null
  documentUrl: string | null
  verificationStatus: VerificationStatus
  reviewedByUserId: string | null
  reviewNote: string | null
  createdAt: string
  updatedAt: string
}

export interface CertificationWithCoach extends Certification {
  coachProfile: {
    id: string
    displayName: string
    userId: string
  }
}

export interface CreateCoachProfileDto {
  displayName: string
  bio?: string
  avatarUrl?: string
  level?: CoachLevel
  yearsExperience?: number
  specialties?: string[]
  languages?: string[]
  locationCity?: string
  hourlyRateVnd?: number
  paymentAccountName: string
  paymentAccountNumber: string
  paymentBankName: string
  paymentQrUrl?: string
}

export interface UpdateCoachProfileDto {
  displayName?: string
  bio?: string
  avatarUrl?: string
  level?: CoachLevel
  yearsExperience?: number
  specialties?: string[]
  languages?: string[]
  locationCity?: string
  hourlyRateVnd?: number
  paymentAccountName?: string
  paymentAccountNumber?: string
  paymentBankName?: string
  paymentQrUrl?: string
}

export interface CreateCertificationDto {
  name: string
  issuingOrganization: string
  issuedAt: string
  expiresAt?: string | null
  documentUrl: string
}

export interface CoachScheduleParticipant {
  userId: string
  name: string
  avatar: string | null
}

export interface CoachScheduleApiProfile {
  id?: string
  userId?: string
  displayName?: string
  fullName?: string
  name?: string
  avatarUrl?: string | null
  avatar?: string | null
}

export interface CoachScheduleApiItem {
  id: string
  kind?: "class" | "booking"
  type?: "class" | "booking"
  title: string
  description?: string | null
  priceVnd?: number | null
  coverImageUrl?: string | null
  startsAt?: string
  startTime?: string
  endsAt?: string
  endTime?: string
  status: string
  sourceStatus?: string | null
  paymentStatus?: string | null
  learners?: Array<{
    id?: string
    userId?: string
    name?: string
    avatar?: string | null
    avatarUrl?: string | null
  }>
  learnerProfile?: CoachScheduleApiProfile | null
  coachProfile?: CoachScheduleApiProfile | null
  classId?: string | null
  bookingId?: string | null
  courtId?: string | null
  locationDescription?: string | null
  location?: string | null
  meetingUrl?: string | null
  learnerCount?: number
  actions?: string[]
}

export interface CoachScheduleApiResponse {
  success: boolean
  data: CoachScheduleApiItem[]
  pagination: PaginationMeta
  summary: CoachScheduleSummary
  filters: CoachScheduleFilters
}

export interface CoachScheduleItem {
  id: string
  type: "class" | "booking"
  title: string
  description: string | null
  priceVnd: number | null
  coverImageUrl: string | null
  startTime: string
  endTime: string
  status: "upcoming" | "live" | "past" | "pending"
  sourceStatus: string | null
  paymentStatus: string | null
  learners: CoachScheduleParticipant[]
  classId: string | null
  bookingId: string | null
  courtId: string | null
  location: string | null
  meetingUrl: string | null
  learnerCount: number
  coachName: string | null
  learnerName: string | null
  actions: string[]
}

export interface CoachScheduleSummary {
  total: number
  classCount: number
  bookingCount: number
  upcomingCount: number
  liveCount: number
  pastCount: number
  pendingCount: number
}

export interface CoachScheduleFilters {
  learners: { userId: string; name: string }[]
  classes: { classId: string; title: string }[]
}

export interface CoachScheduleResponse {
  success: boolean
  data: CoachScheduleItem[]
  pagination: PaginationMeta
  summary: CoachScheduleSummary
  filters: CoachScheduleFilters
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface CoachClass {
  id: string
  coachProfileId: string
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
  createdAt: string
  updatedAt: string
  schedules: ClassScheduleEntry[]
  _count?: {
    enrollments: number
  }
  coachProfile?: {
    displayName?: string
    avatarUrl?: string
  }
}

export type ClassStatus =
  | "DRAFT"
  | "OPEN"
  | "FULL"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED"

export interface ClassScheduleEntry {
  id: string
  classId: string
  scheduledAt: string
  durationMinutes: number
  topic: string
  note: string
  courtBookingId?: string | null
  courtId?: string | null
  locationDescription?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCoachClassDto {
  title: string
  description?: string
  level?: CoachLevel
  capacity: number
  priceVnd: number
  locationDescription?: string
  coverImageUrl?: string
  startDate?: string
  endDate?: string
}

export interface UpdateCoachClassDto {
  title?: string
  description?: string
  level?: CoachLevel
  capacity?: number
  priceVnd?: number
  locationDescription?: string
  coverImageUrl?: string
  startDate?: string
  endDate?: string
}

export interface CreateClassScheduleDto {
  scheduledAt: string
  durationMinutes: number
  topic?: string
  note?: string
  courtBookingId?: string
  courtId?: string
  locationDescription?: string
}

export interface UpdateClassScheduleLocationDto {
  courtBookingId?: string
  courtId?: string
  locationDescription?: string
}

export interface DiscoverClassItem {
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
    bank: {
      bankName: string
      bankAccountNumber: string
      bankAccountName: string
    }
  }
}

export interface Enrollment {
  id: string
  classId: string
  learnerId: string
  status: EnrollmentStatus
  paymentStatus: PaymentStatus
  amountVnd: number
  paymentProofUrl?: string
  learnerProfile: {
    id: string
    name: string
    email: string
    role: string
    avatarUrl: string
  }
  coachPaymentInfo?: {
    paymentAccountName: string
    paymentAccountNumber: string
    paymentBankName: string
    paymentQrUrl: string
  }
  classDetail?: CoachClass
}

export type EnrollmentStatus = "ACTIVE" | "CANCELLED" | "COMPLETED"
export type PaymentStatus =
  | "PENDING_PROOF"
  | "PENDING_REVIEW"
  | "SETTLED"
  | "REJECTED"

export interface CoachLearner {
  id: string
  name: string
  email: string
  avatarUrl: string
  latestActivityAt: string | null
  classEnrollmentCount: number
  activeClassEnrollmentCount: number
  cancelledClassEnrollmentCount: number
  classPaymentPendingReviewCount: number
  classPaymentSettledCount: number
  classPaymentRejectedCount: number
  privateBookingCount: number
  pendingBookingCount: number
  confirmedBookingCount: number
  completedBookingCount: number
  cancelledBookingCount: number
  rejectedBookingCount: number
  bookingPaymentPendingReviewCount: number
  bookingPaymentSettledCount: number
  bookingPaymentRejectedCount: number
}

export interface CoachLearnerDetail extends CoachLearner {
  phone: string | null
  bio: string | null
  joinedAt: string | null
  totalSessions: number
  completedSessions: number
  enrollments: {
    classId: string
    className: string
    enrolledAt: string
    status: string
  }[]
  bookings: {
    bookingId: string
    scheduledAt: string
    status: string
    durationMinutes: number
  }[]
  upcomingSessions: {
    type: string
    title: string
    startTime: string
    endTime: string
    status: string
  }[]
}

export interface AttentionLearner {
  learnerProfile: {
    name: string
    avatarUrl: string | null
  }
  upcomingSessionCount: number
  classPaymentPendingReviewCount: number
  bookingPaymentPendingReviewCount: number
}

export interface CoachLearnerDashboard {
  totalLearners: number
  learnersWithPendingClassPayments: number
  learnersWithPendingBookingPayments: number
  learnersWithUpcomingSessions: number
  upcomingSessionTotal: number
  attentionLearners: AttentionLearner[]
}

export interface Review {
  reviewId: string
  rating: number
  comment: string | null
  createdAt: string
  updatedAt: string
  reviewerProfile: {
    userId: string
    name: string
    avatar: string | null
  }
}

export interface ReviewResponse {
  reviewCount: number
  averageRating: number
  reviews: Review[]
}

export interface CreateReviewDto {
  rating: number
  comment?: string
}

export interface UpdateReviewDto {
  rating?: number
  comment?: string
}

export interface CreateRecommendationDto {
  recommendedToId: string
  message?: string
}

export interface RevenueSummary {
  year: number
  period: string
  totals: {
    classRevenueVnd: number
    bookingRevenueVnd: number
    totalRevenueVnd: number
    courtCostVnd: number
    netRevenueVnd: number
    classSettlementCount: number
    bookingSettlementCount: number
    totalSettlementCount: number
  }
  buckets: RevenueBucket[]
}

export interface RevenueBucket {
  periodLabel: string
  classRevenueVnd: number
  bookingRevenueVnd: number
  totalRevenueVnd: number
  courtCostVnd: number
  netRevenueVnd: number
}

export interface ClassRevenue {
  classId: string
  title?: string
  className?: string
  status?: string
  level?: string
  locationDescription?: string | null
  coverImageUrl?: string | null
  enrolledLearnerCount: number
  settledEnrollmentCount: number
  settledRevenueVnd: number
  firstSettledAt?: string | null
  lastSettledAt?: string | null
  settledAt?: string | null
}

export interface BookingRevenue {
  bookingId: string
  learnerProfile: {
    name: string
    avatarUrl: string | null
  }
  sessionAt: string
  durationMinutes: number
  status?: string
  paymentStatus?: string
  priceVnd: number
  courtCostVnd: number | null
  netRevenueVnd: number
  settledAt: string | null
  coachNote?: string | null
}

export interface Booking {
  id: string
  coachProfileId: string
  learnerId: string
  sessionAt: string
  durationMinutes: number
  priceVnd: number
  courtBookingId?: string | null
  courtId?: string | null
  courtCostVnd?: number | null
  status: BookingStatus
  paymentStatus: PaymentStatus | null
  paymentProofUrl: string | null
  locationDescription?: string | null
  learnerProfile?: {
    id: string
    name: string
    fullName?: string
    avatarUrl: string
    email?: string
    role?: string
  }
  coachProfile?: {
    id: string
    fullName?: string
    name?: string
    avatarUrl: string
    hourlyRateVnd: number
    bio: string
    bankInfo?: {
      bankName: string
      accountNumber: string
      accountHolder: string
    }
  }
  learnerNote?: string
  coachNote?: string
  cancelReason?: string
  createdAt: string
  updatedAt: string
}

export type BookingStatus =
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED"

export interface CreateBookingDto {
  sessionAt: string
  durationMinutes: number
  learnerNote?: string
  courtBookingId?: string
  courtId?: string
  locationDescription?: string
}

export interface UpdateBookingLocationDto {
  courtBookingId?: string
  courtId?: string
  locationDescription?: string
}

export interface LearnerScheduleItem {
  id: string
  kind: "class" | "booking"
  title: string
  priceVnd: number | null
  coverImageUrl: string | null
  startsAt: string
  endsAt: string
  durationMinutes: number
  status: string
  sourceStatus: string | null
  coachProfile: {
    id: string
    displayName: string
    avatarUrl: string | null
    verificationStatus: string
    locationCity: string | null
  } | null
  locationDescription: string | null
  courtId: string | null
  topic: string | null
  note: string | null
  paymentStatus: string | null
  classId: string | null
  bookingId: string | null
  actions: string[]
}

export interface LearnerScheduleResponse {
  data: LearnerScheduleItem[]
  pagination: PaginationMeta
  summary: {
    total: number
    classCount: number
    bookingCount: number
    upcomingCount: number
    liveCount: number
    completedCount: number
    cancelledCount: number
    pendingConfirmationCount: number
    distinctCoachCount: number
    nextSessionAt: string | null
    lastSessionAt: string | null
  }
  filters: {
    coachProfiles: { id: string; displayName: string }[]
    classes: { id: string; title: string }[]
  }
}

export interface ApiResponse<T> {
  success?: boolean
  data: T
  pagination?: PaginationMeta
  meta?: PaginationMeta
  message?: string
}

export type DiscoveryTabValue =
  | "overview"
  | "schedule"
  | "reviews"
  | "classes"
  | "info"
  | "stats"
