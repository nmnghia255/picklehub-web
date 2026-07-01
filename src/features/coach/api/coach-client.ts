const PROXY_BASE = "/api/proxy"

type QueryParams = Record<string, string | number | boolean | null | undefined>

function toSearchParams(params?: QueryParams) {
  const searchParams = new URLSearchParams()
  if (!params) return searchParams
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    searchParams.set(key, String(value))
  }
  return searchParams
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  params?: QueryParams
): Promise<T> {
  const search = params ? `?${toSearchParams(params).toString()}` : ""
  const url = `${PROXY_BASE}${path}${search}`

  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const message =
      (payload as { message?: string }).message ||
      `Request failed with status ${response.status}`
    throw new Error(message)
  }

  const json = await response.json()

  // Auto-unwrap {success, data} envelope when data is the sole payload
  // (e.g. {success: true, data: {...}}), but NOT when data coexists with
  // pagination/summary/filters (e.g. {success, data: [...], pagination: {...}}).
  if (
    json &&
    typeof json === "object" &&
    "success" in json &&
    "data" in json &&
    Object.keys(json).length === 2
  ) {
    return json.data as T
  }

  return json as T
}

export const CoachClient = {
  // ===================== Public Discovery =====================
  listCoaches: (params?: { city?: string; level?: string; page?: number; limit?: number }) =>
    apiFetch<{ data: import("../types/coach").CoachProfileSummary[]; pagination: import("../types/coach").PaginationMeta }>(
      "/coaches", { method: "GET" }, params as QueryParams
    ),

  getCoachPublicProfile: (coachId: string) =>
    apiFetch<import("../types/coach").CoachProfile>(`/coaches/${coachId}`),

  listCoachOpenClasses: (coachId: string) =>
    apiFetch<import("../types/coach").CoachClass[]>(`/coaches/${coachId}/classes`),

  // ===================== Profile =====================
  registerAsCoach: (dto: import("../types/coach").CreateCoachProfileDto) =>
    apiFetch<import("../types/coach").CoachProfile>("/coach/profile", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  getMyCoachProfile: () =>
    apiFetch<import("../types/coach").CoachProfile>("/coach/profile/me"),

  updateMyCoachProfile: (dto: import("../types/coach").UpdateCoachProfileDto) =>
    apiFetch<import("../types/coach").CoachProfile>("/coach/profile/me", {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  publishMyProfile: () =>
    apiFetch<import("../types/coach").CoachProfile>("/coach/profile/me/publish", {
      method: "POST",
    }),

  // ===================== Certifications =====================
  addCertification: (dto: import("../types/coach").CreateCertificationDto) =>
    apiFetch<import("../types/coach").Certification>("/coach/certifications", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  listMyCertifications: () =>
    apiFetch<import("../types/coach").Certification[]>("/coach/certifications"),

  deleteCertification: (certId: string) =>
    apiFetch<{ message: string }>(`/coach/certifications/${certId}`, {
      method: "DELETE",
    }),

  // ===================== Admin Certifications =====================
  adminListCertifications: (params?: { verificationStatus?: string; coachProfileId?: string; page?: number; limit?: number }) =>
    apiFetch<{ data: import("../types/coach").CertificationWithCoach[]; meta: import("../types/coach").PaginationMeta }>(
      "/admin/coaches/certifications", { method: "GET" }, params as QueryParams
    ),

  adminListPendingCertifications: () =>
    apiFetch<import("../types/coach").CertificationWithCoach[]>("/admin/coaches/certifications/pending"),

  adminReviewCertification: (certId: string, dto: { verificationStatus: "VERIFIED" | "REJECTED"; reviewNote?: string }) =>
    apiFetch<import("../types/coach").Certification>(`/admin/coaches/certifications/${certId}/review`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  // ===================== Coach Schedule =====================
  getCoachSchedule: (params?: Record<string, unknown>) =>
    apiFetch<import("../types/coach").CoachScheduleResponse>(
      "/coach/schedule", { method: "GET" }, params as QueryParams
    ),

  // ===================== Class Schedules =====================
  addScheduleSlot: (classId: string, dto: import("../types/coach").CreateClassScheduleDto) =>
    apiFetch<import("../types/coach").ClassScheduleEntry>(`/coach/classes/${classId}/schedules`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  listScheduleEntries: (classId: string, params?: { from?: string; to?: string }) =>
    apiFetch<import("../types/coach").ClassScheduleEntry[]>(
      `/coach/classes/${classId}/schedules`, { method: "GET" }, params as QueryParams
    ),

  removeScheduleSlot: (classId: string, scheduleId: string) =>
    apiFetch<{ message: string }>(`/coach/classes/${classId}/schedules/${scheduleId}`, {
      method: "DELETE",
    }),

  // ===================== Classes =====================
  discoverOpenClasses: (params?: { city?: string; level?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    apiFetch<{ data: import("../types/coach").DiscoverClassItem[]; meta: import("../types/coach").PaginationMeta }>(
      "/classes", { method: "GET" }, params as QueryParams
    ),

  getClassPublicDetail: (classId: string) =>
    apiFetch<import("../types/coach").DiscoverClassItem>(`/classes/${classId}`),

  createClass: (dto: import("../types/coach").CreateCoachClassDto) =>
    apiFetch<import("../types/coach").CoachClass>("/coach/classes", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  listMyClasses: (params?: { status?: string; level?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    apiFetch<import("../types/coach").CoachClass[]>(
      "/coach/classes", { method: "GET" }, params as QueryParams
    ),

  getMyClassDetail: (classId: string) =>
    apiFetch<import("../types/coach").CoachClass>(`/coach/classes/${classId}`),

  updateClass: (classId: string, dto: import("../types/coach").UpdateCoachClassDto) =>
    apiFetch<import("../types/coach").CoachClass>(`/coach/classes/${classId}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  publishClass: (classId: string) =>
    apiFetch<{ id: string; status: string; updatedAt: string }>(`/coach/classes/${classId}/publish`, {
      method: "POST",
    }),

  cancelClass: (classId: string) =>
    apiFetch<{ id: string; status: string; updatedAt: string }>(`/coach/classes/${classId}/cancel`, {
      method: "POST",
    }),

  // ===================== Enrollments =====================
  enrollInClass: (classId: string) =>
    apiFetch<import("../types/coach").Enrollment>(`/classes/${classId}/enroll`, {
      method: "POST",
    }),

  listMyEnrollments: () =>
    apiFetch<import("../types/coach").Enrollment[]>("/learner/class-enrollments"),

  uploadEnrollmentPaymentProof: (enrollmentId: string, dto: { paymentProofUrl: string }) =>
    apiFetch<import("../types/coach").Enrollment>(
      `/learner/class-enrollments/${enrollmentId}/payment-proof`,
      { method: "PATCH", body: JSON.stringify(dto) }
    ),

  cancelEnrollment: (enrollmentId: string) =>
    apiFetch<{ message: string }>(`/learner/class-enrollments/${enrollmentId}`, {
      method: "DELETE",
    }),

  viewClassEnrollments: (classId: string) =>
    apiFetch<import("../types/coach").Enrollment[]>(`/coach/classes/${classId}/enrollments`),

  settleEnrollmentPayment: (classId: string, enrollmentId: string) =>
    apiFetch<import("../types/coach").Enrollment>(
      `/coach/classes/${classId}/enrollments/${enrollmentId}/settle`,
      { method: "PATCH" }
    ),

  rejectEnrollmentPayment: (classId: string, enrollmentId: string, dto?: { reason?: string }) =>
    apiFetch<import("../types/coach").Enrollment>(
      `/coach/classes/${classId}/enrollments/${enrollmentId}/reject-payment`,
      { method: "PATCH", body: JSON.stringify(dto ?? {}) }
    ),

  // ===================== Learners =====================
  listLearners: (params?: { search?: string; kind?: string; page?: number; limit?: number }) =>
    apiFetch<{ data: import("../types/coach").CoachLearner[]; pagination: import("../types/coach").PaginationMeta }>(
      "/coach/learners", { method: "GET" }, params as QueryParams
    ),

  getLearnerDashboard: () =>
    apiFetch<import("../types/coach").CoachLearnerDashboard>("/coach/learners/dashboard"),

  getLearnerDetail: (learnerId: string) =>
    apiFetch<import("../types/coach").CoachLearnerDetail>(`/coach/learners/${learnerId}`),

  // ===================== Reviews =====================
  createReview: (coachId: string, dto: import("../types/coach").CreateReviewDto) =>
    apiFetch<{ reviewId: string; rating: number; comment: string; createdAt: string }>(
      `/coaches/${coachId}/reviews`,
      { method: "POST", body: JSON.stringify(dto) }
    ),

  getCoachReviews: (coachId: string) =>
    apiFetch<import("../types/coach").ReviewResponse>(`/coaches/${coachId}/reviews`),

  updateReview: (coachId: string, reviewId: string, dto: import("../types/coach").UpdateReviewDto) =>
    apiFetch<{ reviewId: string; rating: number; comment: string; updatedAt: string }>(
      `/coaches/${coachId}/reviews/${reviewId}`,
      { method: "PATCH", body: JSON.stringify(dto) }
    ),

  deleteReview: (coachId: string, reviewId: string) =>
    apiFetch<{ message: string }>(`/coaches/${coachId}/reviews/${reviewId}`, {
      method: "DELETE",
    }),

  recommendCoach: (coachId: string, dto: import("../types/coach").CreateRecommendationDto) =>
    apiFetch<{ recommendationId: string; recommendedToId: string; message: string; createdAt: string }>(
      `/coaches/${coachId}/recommendations`,
      { method: "POST", body: JSON.stringify(dto) }
    ),

  // ===================== Revenue =====================
  getRevenueSummary: (params?: { period?: string; year?: number }) =>
    apiFetch<import("../types/coach").RevenueSummary>(
      "/coach/revenue/summary", { method: "GET" }, params as QueryParams
    ),

  getClassRevenue: (params?: { page?: number; limit?: number; from?: string; to?: string }) =>
    apiFetch<{ data: import("../types/coach").ClassRevenue[]; pagination: import("../types/coach").PaginationMeta }>(
      "/coach/revenue/classes", { method: "GET" }, params as QueryParams
    ),

  getBookingRevenue: (params?: { page?: number; limit?: number; from?: string; to?: string }) =>
    apiFetch<{ data: import("../types/coach").BookingRevenue[]; pagination: import("../types/coach").PaginationMeta }>(
      "/coach/revenue/bookings", { method: "GET" }, params as QueryParams
    ),

  // ===================== Bookings =====================
  createBooking: (coachId: string, dto: import("../types/coach").CreateBookingDto) =>
    apiFetch<import("../types/coach").Booking>(`/coaches/${coachId}/bookings`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  listMyBookings: (params?: { status?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    apiFetch<{ data: import("../types/coach").Booking[]; meta: import("../types/coach").PaginationMeta }>(
      "/learner/bookings", { method: "GET" }, params as QueryParams
    ),

  uploadBookingPaymentProof: (bookingId: string, dto: { paymentProofUrl: string }) =>
    apiFetch<import("../types/coach").Booking>(`/learner/bookings/${bookingId}/payment-proof`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  cancelMyBooking: (bookingId: string) =>
    apiFetch<{ id: string; status: string; cancelReason: string | null; updatedAt: string }>(
      `/learner/bookings/${bookingId}`, { method: "DELETE" }
    ),

  listIncomingBookings: (params?: { status?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    apiFetch<{ data: import("../types/coach").Booking[]; meta: import("../types/coach").PaginationMeta }>(
      "/coach/bookings", { method: "GET" }, params as QueryParams
    ),

  confirmBooking: (bookingId: string, dto?: { coachNote?: string }) =>
    apiFetch<import("../types/coach").Booking>(`/coach/bookings/${bookingId}/confirm`, {
      method: "PATCH",
      body: JSON.stringify(dto ?? {}),
    }),

  rejectBooking: (bookingId: string, dto?: { cancelReason?: string }) =>
    apiFetch<import("../types/coach").Booking>(`/coach/bookings/${bookingId}/reject`, {
      method: "PATCH",
      body: JSON.stringify(dto ?? {}),
    }),

  settleBookingPayment: (bookingId: string) =>
    apiFetch<import("../types/coach").Booking>(`/coach/bookings/${bookingId}/settle-payment`, {
      method: "PATCH",
    }),

  completeBooking: (bookingId: string) =>
    apiFetch<import("../types/coach").Booking>(`/coach/bookings/${bookingId}/complete`, {
      method: "PATCH",
    }),

  rejectBookingPayment: (bookingId: string) =>
    apiFetch<import("../types/coach").Booking>(`/coach/bookings/${bookingId}/reject-payment`, {
      method: "PATCH",
    }),

  cancelBooking: (bookingId: string, dto?: { cancelReason?: string }) =>
    apiFetch<import("../types/coach").Booking>(`/coach/bookings/${bookingId}`, {
      method: "DELETE",
      body: JSON.stringify(dto ?? {}),
    }),

  // ===================== Learning Schedule =====================
  getLearnerSchedule: (params?: Record<string, unknown>) =>
    apiFetch<{
      success: boolean
      data: import("../types/coach").LearnerScheduleItem[]
      pagination: import("../types/coach").PaginationMeta
      summary: { total: number; classCount: number; bookingCount: number; upcomingCount: number; liveCount: number; pastCount: number; pendingCount: number }
      filters: { coachProfiles: { coachProfileId: string; name: string }[]; classes: { classId: string; title: string }[] }
    }>("/learner/schedule", { method: "GET" }, params as QueryParams),
}
