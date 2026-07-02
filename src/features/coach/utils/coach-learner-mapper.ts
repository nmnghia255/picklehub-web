export interface NormalizedLearner {
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

export function normalizeLearner(item: any): NormalizedLearner {
  const profile = item.learnerProfile ?? item
  return {
    id: item.learnerId ?? item.id ?? "",
    name: profile.name ?? "",
    email: profile.email ?? "",
    avatarUrl: profile.avatarUrl ?? profile.avatar ?? "",
    latestActivityAt: item.latestActivityAt ?? null,
    classEnrollmentCount: item.classEnrollmentCount ?? 0,
    activeClassEnrollmentCount: item.activeClassEnrollmentCount ?? 0,
    cancelledClassEnrollmentCount: item.cancelledClassEnrollmentCount ?? 0,
    classPaymentPendingReviewCount: item.classPaymentPendingReviewCount ?? 0,
    classPaymentSettledCount: item.classPaymentSettledCount ?? 0,
    classPaymentRejectedCount: item.classPaymentRejectedCount ?? 0,
    privateBookingCount: item.privateBookingCount ?? 0,
    pendingBookingCount: item.pendingBookingCount ?? 0,
    confirmedBookingCount: item.confirmedBookingCount ?? 0,
    completedBookingCount: item.completedBookingCount ?? 0,
    cancelledBookingCount: item.cancelledBookingCount ?? 0,
    rejectedBookingCount: item.rejectedBookingCount ?? 0,
    bookingPaymentPendingReviewCount: item.bookingPaymentPendingReviewCount ?? 0,
    bookingPaymentSettledCount: item.bookingPaymentSettledCount ?? 0,
    bookingPaymentRejectedCount: item.bookingPaymentRejectedCount ?? 0,
    phone: item.phone ?? null,
    bio: item.bio ?? null,
    joinedAt: item.joinedAt ?? null,
    totalSessions: item.totalSessions ?? 0,
    completedSessions: item.completedSessions ?? 0,
    enrollments: Array.isArray(item.enrollments) ? item.enrollments : [],
    bookings: Array.isArray(item.bookings) ? item.bookings : [],
    upcomingSessions: Array.isArray(item.upcomingSessions) ? item.upcomingSessions : [],
  }
}
