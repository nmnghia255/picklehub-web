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

type RawLearner = Record<string, unknown>

function rawStr(val: unknown): string {
  return typeof val === "string" ? val : ""
}

function rawNum(val: unknown): number {
  return typeof val === "number" ? val : 0
}

export function normalizeLearner(item: RawLearner): NormalizedLearner {
  const profile = (item.learnerProfile ?? item) as RawLearner
  return {
    id: rawStr(item.learnerId ?? item.id),
    name: rawStr(profile.name),
    email: rawStr(profile.email),
    avatarUrl: rawStr(profile.avatarUrl ?? profile.avatar),
    latestActivityAt: rawStr(item.latestActivityAt) || null,
    classEnrollmentCount: rawNum(item.classEnrollmentCount),
    activeClassEnrollmentCount: rawNum(item.activeClassEnrollmentCount),
    cancelledClassEnrollmentCount: rawNum(item.cancelledClassEnrollmentCount),
    classPaymentPendingReviewCount: rawNum(item.classPaymentPendingReviewCount),
    classPaymentSettledCount: rawNum(item.classPaymentSettledCount),
    classPaymentRejectedCount: rawNum(item.classPaymentRejectedCount),
    privateBookingCount: rawNum(item.privateBookingCount),
    pendingBookingCount: rawNum(item.pendingBookingCount),
    confirmedBookingCount: rawNum(item.confirmedBookingCount),
    completedBookingCount: rawNum(item.completedBookingCount),
    cancelledBookingCount: rawNum(item.cancelledBookingCount),
    rejectedBookingCount: rawNum(item.rejectedBookingCount),
    bookingPaymentPendingReviewCount: rawNum(
      item.bookingPaymentPendingReviewCount
    ),
    bookingPaymentSettledCount: rawNum(item.bookingPaymentSettledCount),
    bookingPaymentRejectedCount: rawNum(item.bookingPaymentRejectedCount),
    phone: rawStr(item.phone) || null,
    bio: rawStr(item.bio) || null,
    joinedAt: rawStr(item.joinedAt) || null,
    totalSessions: rawNum(item.totalSessions),
    completedSessions: rawNum(item.completedSessions),
    enrollments: Array.isArray(item.enrollments)
      ? (item.enrollments as NormalizedLearner["enrollments"])
      : [],
    bookings: Array.isArray(item.bookings)
      ? (item.bookings as RawLearner[]).map((b) => ({
          bookingId: rawStr(b.bookingId ?? b.id),
          scheduledAt: rawStr(b.sessionAt ?? b.scheduledAt),
          status: rawStr(b.status),
          durationMinutes: rawNum(b.durationMinutes),
        }))
      : [],
    upcomingSessions: Array.isArray(item.upcomingSessions)
      ? (item.upcomingSessions as RawLearner[]).map((s) => ({
          type: rawStr(s.type),
          title: rawStr(s.title),
          startTime: rawStr(s.startsAt ?? s.startTime),
          endTime: rawStr(s.endsAt ?? s.endTime),
          status: rawStr(s.status),
        }))
      : [],
  }
}
