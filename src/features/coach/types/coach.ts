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
export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED"

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
  issuingOrganization?: string
  issuedAt?: string
  expiresAt?: string
  documentUrl?: string
}

export interface CoachScheduleItem {
  id: string
  type: "class" | "booking"
  title: string
  description: string | null
  startTime: string
  endTime: string
  status: "upcoming" | "live" | "past" | "pending"
  learners: {
    userId: string
    name: string
    avatar: string | null
  }[]
  classId: string | null
  bookingId: string | null
  location: string | null
  meetingUrl: string | null
  learnerCount: number
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

export type ClassStatus = "DRAFT" | "OPEN" | "FULL" | "ONGOING" | "COMPLETED" | "CANCELLED"

export interface ClassScheduleEntry {
  id: string
  classId: string
  scheduledAt: string
  durationMinutes: number
  topic: string
  note: string
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
export type PaymentStatus = "PENDING_PROOF" | "PENDING_REVIEW" | "SETTLED" | "REJECTED"

export interface CoachLearner {
  id: string
  name: string
  email: string
  avatar: string | null
  phone: string | null
  enrolledClassCount: number
  completedBookingCount: number
  lastActiveAt: string | null
  status: "active" | "inactive"
}

export interface CoachLearnerDetail {
  id: string
  name: string
  email: string
  avatar: string | null
  phone: string | null
  bio: string | null
  joinedAt: string
  enrollments: {
    classId: string
    className: string
    enrolledAt: string
    status: "active" | "completed" | "cancelled"
  }[]
  bookings: {
    bookingId: string
    scheduledAt: string
    status: "confirmed" | "completed" | "cancelled"
    durationMinutes: number
  }[]
  upcomingSessions: {
    type: "class" | "booking"
    title: string
    startTime: string
    endTime: string
    status: "upcoming" | "live"
  }[]
  totalSessions: number
  completedSessions: number
}

export interface CoachLearnerDashboard {
  totalLearners: number
  activeLearners: number
  newThisMonth: number
  classLearners: number
  bookingLearners: number
  unenrolledLearners: number
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
  classRevenueVnd: number
  bookingRevenueVnd: number
  totalRevenueVnd: number
  buckets: RevenueBucket[]
}

export interface RevenueBucket {
  periodLabel: string
  classRevenueVnd: number
  bookingRevenueVnd: number
  totalRevenueVnd: number
}

export interface ClassRevenue {
  classId: string
  className: string
  totalSessions: number
  settledSessions: number
  enrolledLearners: number
  revenueVnd: number
  settledAt: string | null
}

export interface BookingRevenue {
  bookingId: string
  learner: {
    userId: string
    name: string
    avatar: string | null
  }
  scheduledAt: string
  durationMinutes: number
  revenueVnd: number
  settledAt: string | null
}

export interface Booking {
  id: string
  coachProfileId: string
  learnerId: string
  sessionAt: string
  durationMinutes: number
  priceVnd: number
  status: BookingStatus
  paymentStatus: PaymentStatus | null
  paymentProofUrl: string | null
  learnerProfile?: {
    id: string
    fullName: string
    avatarUrl: string
    bio: string
  }
  coachProfile?: {
    id: string
    fullName: string
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
}

export interface LearnerScheduleItem {
  id: string
  type: "class" | "booking"
  title: string
  description: string | null
  startTime: string
  endTime: string
  status: "upcoming" | "live" | "past" | "pending"
  coach: {
    coachProfileId: string
    name: string
    avatar: string | null
  }
  classId: string | null
  bookingId: string | null
  location: string | null
  meetingUrl: string | null
  isReviewed: boolean
}

export interface LearnerScheduleResponse {
  success: boolean
  data: LearnerScheduleItem[]
  pagination: PaginationMeta
  summary: {
    total: number
    classCount: number
    bookingCount: number
    upcomingCount: number
    liveCount: number
    pastCount: number
    pendingCount: number
  }
  filters: {
    coachProfiles: { coachProfileId: string; name: string }[]
    classes: { classId: string; title: string }[]
  }
}

export interface ApiResponse<T> {
  success?: boolean
  data: T
  pagination?: PaginationMeta
  meta?: PaginationMeta
  message?: string
}
