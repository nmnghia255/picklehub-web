import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  ApiResponse,
  Booking,
  BookingRevenue,
  Certification,
  CertificationWithCoach,
  ClassRevenue,
  ClassScheduleEntry,
  CoachClass,
  CoachLearner,
  CoachLearnerDashboard,
  CoachLearnerDetail,
  CoachProfile,
  CoachProfileSummary,
  CoachScheduleResponse,
  CreateBookingDto,
  CreateCertificationDto,
  CreateClassScheduleDto,
  CreateCoachClassDto,
  CreateCoachProfileDto,
  CreateRecommendationDto,
  CreateReviewDto,
  DiscoverClassItem,
  Enrollment,
  PaginationMeta,
  RevenueSummary,
  ReviewResponse,
  UpdateCoachClassDto,
  UpdateCoachProfileDto,
  UpdateReviewDto,
} from "../types/coach"

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const CoachService = {
  // ===================== Public Discovery =====================

  listCoaches: async function (
    params?: {
      city?: string
      level?: string
      page?: number
      limit?: number
    }
  ): Promise<{ data: CoachProfileSummary[]; pagination: PaginationMeta }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<CoachProfileSummary[]>>("/api/coaches", { params })
    return {
      data: response.data.data,
      pagination: response.data.pagination ?? response.data.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    }
  },

  getCoachPublicProfile: async function (coachId: string): Promise<CoachProfile> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<CoachProfile> | CoachProfile>(`/api/coaches/${coachId}`)
    return unwrapApiResponse(response.data)
  },

  listCoachOpenClasses: async function (coachId: string): Promise<CoachClass[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<CoachClass[]> | CoachClass[]>(`/api/coaches/${coachId}/classes`)
    return unwrapApiResponse(response.data)
  },

  // ===================== Profile - Coach Actions =====================

  registerAsCoach: async function (dto: CreateCoachProfileDto): Promise<CoachProfile> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<CoachProfile> | CoachProfile>("/api/coach/profile", dto)
    return unwrapApiResponse(response.data)
  },

  getMyCoachProfile: async function (): Promise<CoachProfile> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<CoachProfile> | CoachProfile>("/api/coach/profile/me")
    return unwrapApiResponse(response.data)
  },

  updateMyCoachProfile: async function (dto: UpdateCoachProfileDto): Promise<CoachProfile> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<CoachProfile> | CoachProfile>("/api/coach/profile/me", dto)
    return unwrapApiResponse(response.data)
  },

  publishMyProfile: async function (): Promise<CoachProfile> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<CoachProfile> | CoachProfile>("/api/coach/profile/me/publish")
    return unwrapApiResponse(response.data)
  },

  // ===================== Certifications - Coach Actions =====================

  addCertification: async function (dto: CreateCertificationDto): Promise<Certification> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Certification> | Certification>("/api/coach/certifications", dto)
    return unwrapApiResponse(response.data)
  },

  listMyCertifications: async function (): Promise<Certification[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Certification[]> | Certification[]>("/api/coach/certifications")
    return unwrapApiResponse(response.data)
  },

  deleteCertification: async function (certId: string): Promise<{ message: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<{ message: string }> | { message: string }>(
      `/api/coach/certifications/${certId}`
    )
    return unwrapApiResponse(response.data)
  },

  // ===================== Certifications - Admin =====================

  adminListCertifications: async function (params?: {
    verificationStatus?: string
    coachProfileId?: string
    page?: number
    limit?: number
  }): Promise<{ data: CertificationWithCoach[]; meta: PaginationMeta }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<CertificationWithCoach[]>>("/api/admin/coaches/certifications", { params })
    return { data: response.data.data, meta: response.data.meta ?? response.data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 } }
  },

  adminListPendingCertifications: async function (): Promise<CertificationWithCoach[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<CertificationWithCoach[]> | CertificationWithCoach[]>(
      "/api/admin/coaches/certifications/pending"
    )
    return unwrapApiResponse(response.data)
  },

  adminReviewCertification: async function (
    certId: string,
    dto: { verificationStatus: "VERIFIED" | "REJECTED"; reviewNote?: string }
  ): Promise<Certification> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Certification> | Certification>(
      `/api/admin/coaches/certifications/${certId}/review`,
      dto
    )
    return unwrapApiResponse(response.data)
  },

  // ===================== Coach Schedule =====================

  getCoachSchedule: async function (params?: {
    kind?: string
    state?: string
    learnerId?: string
    classId?: string
    from?: string
    to?: string
    page?: number
    limit?: number
    sort?: string
  }): Promise<CoachScheduleResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<CoachScheduleResponse>("/api/coach/schedule", { params })
    return response.data
  },

  // ===================== Class Schedules - Coach Actions =====================

  addScheduleSlot: async function (classId: string, dto: CreateClassScheduleDto): Promise<ClassScheduleEntry> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<ClassScheduleEntry> | ClassScheduleEntry>(
      `/api/coach/classes/${classId}/schedules`,
      dto
    )
    return unwrapApiResponse(response.data)
  },

  listScheduleEntries: async function (
    classId: string,
    params?: { from?: string; to?: string }
  ): Promise<ClassScheduleEntry[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<ClassScheduleEntry[]> | ClassScheduleEntry[]>(
      `/api/coach/classes/${classId}/schedules`,
      { params }
    )
    return unwrapApiResponse(response.data)
  },

  removeScheduleSlot: async function (classId: string, scheduleId: string): Promise<{ message: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<{ message: string }> | { message: string }>(
      `/api/coach/classes/${classId}/schedules/${scheduleId}`
    )
    return unwrapApiResponse(response.data)
  },

  // ===================== Classes - Public Discovery =====================

  discoverOpenClasses: async function (params?: {
    city?: string
    level?: string
    from?: string
    to?: string
    page?: number
    limit?: number
  }): Promise<{ data: DiscoverClassItem[]; meta: PaginationMeta }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<DiscoverClassItem[]>>("/api/classes", { params })
    return { data: response.data.data, meta: response.data.meta ?? response.data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 } }
  },

  getClassPublicDetail: async function (classId: string): Promise<DiscoverClassItem> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<DiscoverClassItem> | DiscoverClassItem>(`/api/classes/${classId}`)
    return unwrapApiResponse(response.data)
  },

  // ===================== Classes - Coach Actions =====================

  createClass: async function (dto: CreateCoachClassDto): Promise<CoachClass> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<CoachClass> | CoachClass>("/api/coach/classes", dto)
    return unwrapApiResponse(response.data)
  },

  listMyClasses: async function (params?: {
    status?: string
    level?: string
    from?: string
    to?: string
    page?: number
    limit?: number
  }): Promise<CoachClass[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<CoachClass[]> | CoachClass[]>("/api/coach/classes", { params })
    return unwrapApiResponse(response.data)
  },

  getMyClassDetail: async function (classId: string): Promise<CoachClass> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<CoachClass> | CoachClass>(`/api/coach/classes/${classId}`)
    return unwrapApiResponse(response.data)
  },

  updateClass: async function (classId: string, dto: UpdateCoachClassDto): Promise<CoachClass> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<CoachClass> | CoachClass>(
      `/api/coach/classes/${classId}`,
      dto
    )
    return unwrapApiResponse(response.data)
  },

  publishClass: async function (classId: string): Promise<{ id: string; status: string; updatedAt: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<
      ApiResponse<{ id: string; status: string; updatedAt: string }> | { id: string; status: string; updatedAt: string }
    >(`/api/coach/classes/${classId}/publish`)
    return unwrapApiResponse(response.data)
  },

  cancelClass: async function (classId: string): Promise<{ id: string; status: string; updatedAt: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<
      ApiResponse<{ id: string; status: string; updatedAt: string }> | { id: string; status: string; updatedAt: string }
    >(`/api/coach/classes/${classId}/cancel`)
    return unwrapApiResponse(response.data)
  },

  // ===================== Enrollments - Learner Actions =====================

  enrollInClass: async function (classId: string): Promise<Enrollment> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Enrollment> | Enrollment>(`/api/classes/${classId}/enroll`)
    return unwrapApiResponse(response.data)
  },

  listMyEnrollments: async function (): Promise<Enrollment[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Enrollment[]> | Enrollment[]>("/api/learner/class-enrollments")
    return unwrapApiResponse(response.data)
  },

  uploadEnrollmentPaymentProof: async function (
    enrollmentId: string,
    dto: { paymentProofUrl: string }
  ): Promise<Enrollment> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Enrollment> | Enrollment>(
      `/api/learner/class-enrollments/${enrollmentId}/payment-proof`,
      dto
    )
    return unwrapApiResponse(response.data)
  },

  cancelEnrollment: async function (enrollmentId: string): Promise<{ message: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<{ message: string }> | { message: string }>(
      `/api/learner/class-enrollments/${enrollmentId}`
    )
    return unwrapApiResponse(response.data)
  },

  // ===================== Enrollments - Coach Actions =====================

  viewClassEnrollments: async function (classId: string): Promise<Enrollment[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Enrollment[]> | Enrollment[]>(
      `/api/coach/classes/${classId}/enrollments`
    )
    return unwrapApiResponse(response.data)
  },

  settleEnrollmentPayment: async function (classId: string, enrollmentId: string): Promise<Enrollment> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Enrollment> | Enrollment>(
      `/api/coach/classes/${classId}/enrollments/${enrollmentId}/settle`
    )
    return unwrapApiResponse(response.data)
  },

  rejectEnrollmentPayment: async function (
    classId: string,
    enrollmentId: string,
    dto?: { reason?: string }
  ): Promise<Enrollment> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Enrollment> | Enrollment>(
      `/api/coach/classes/${classId}/enrollments/${enrollmentId}/reject-payment`,
      dto ?? {}
    )
    return unwrapApiResponse(response.data)
  },

  // ===================== Learners - Coach Actions =====================

  listLearners: async function (params?: {
    search?: string
    kind?: string
    page?: number
    limit?: number
  }): Promise<{ data: CoachLearner[]; pagination: PaginationMeta }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<CoachLearner[]>>("/api/coach/learners", { params })
    return {
      data: response.data.data,
      pagination: response.data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
    }
  },

  getLearnerDashboard: async function (): Promise<CoachLearnerDashboard> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<{ success: boolean; data: CoachLearnerDashboard }>(
      "/api/coach/learners/dashboard"
    )
    return response.data.data
  },

  getLearnerDetail: async function (learnerId: string): Promise<CoachLearnerDetail> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<{ success: boolean; data: CoachLearnerDetail }>(
      `/api/coach/learners/${learnerId}`
    )
    return response.data.data
  },

  // ===================== Reviews & Recommendations =====================

  createReview: async function (coachId: string, dto: CreateReviewDto): Promise<{ reviewId: string; rating: number; comment: string; createdAt: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<{ success: boolean; data: { reviewId: string; rating: number; comment: string; createdAt: string } }>(
      `/api/coaches/${coachId}/reviews`,
      dto
    )
    return response.data.data
  },

  getCoachReviews: async function (coachId: string): Promise<ReviewResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<{ success: boolean; data: ReviewResponse }>(
      `/api/coaches/${coachId}/reviews`
    )
    return response.data.data
  },

  updateReview: async function (
    coachId: string,
    reviewId: string,
    dto: UpdateReviewDto
  ): Promise<{ reviewId: string; rating: number; comment: string; updatedAt: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<{ success: boolean; data: { reviewId: string; rating: number; comment: string; updatedAt: string } }>(
      `/api/coaches/${coachId}/reviews/${reviewId}`,
      dto
    )
    return response.data.data
  },

  deleteReview: async function (coachId: string, reviewId: string): Promise<{ message: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<{ success: boolean; message: string }>(
      `/api/coaches/${coachId}/reviews/${reviewId}`
    )
    return { message: response.data.message }
  },

  recommendCoach: async function (coachId: string, dto: CreateRecommendationDto): Promise<{ recommendationId: string; recommendedToId: string; message: string; createdAt: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<{ success: boolean; data: { recommendationId: string; recommendedToId: string; message: string; createdAt: string } }>(
      `/api/coaches/${coachId}/recommendations`,
      dto
    )
    return response.data.data
  },

  // ===================== Revenue =====================

  getRevenueSummary: async function (params?: {
    period?: string
    year?: number
  }): Promise<RevenueSummary> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<{ success: boolean; data: RevenueSummary }>("/api/coach/revenue/summary", { params })
    return response.data.data
  },

  getClassRevenue: async function (params?: {
    page?: number
    limit?: number
    from?: string
    to?: string
  }): Promise<{ data: ClassRevenue[]; pagination: PaginationMeta }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<{ success: boolean; data: ClassRevenue[]; pagination: PaginationMeta }>(
      "/api/coach/revenue/classes",
      { params }
    )
    return { data: response.data.data, pagination: response.data.pagination }
  },

  getBookingRevenue: async function (params?: {
    page?: number
    limit?: number
    from?: string
    to?: string
  }): Promise<{ data: BookingRevenue[]; pagination: PaginationMeta }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<{ success: boolean; data: BookingRevenue[]; pagination: PaginationMeta }>(
      "/api/coach/revenue/bookings",
      { params }
    )
    return { data: response.data.data, pagination: response.data.pagination }
  },

  // ===================== Private Bookings - Learner Actions =====================

  createBooking: async function (coachId: string, dto: CreateBookingDto): Promise<Booking> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Booking> | Booking>(`/api/coaches/${coachId}/bookings`, dto)
    return unwrapApiResponse(response.data)
  },

  listMyBookings: async function (params?: {
    status?: string
    from?: string
    to?: string
    page?: number
    limit?: number
  }): Promise<{ data: Booking[]; meta: PaginationMeta }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<{ data: Booking[]; meta: PaginationMeta }>("/api/learner/bookings", { params })
    return response.data
  },

  uploadBookingPaymentProof: async function (bookingId: string, dto: { paymentProofUrl: string }): Promise<Booking> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Booking> | Booking>(
      `/api/learner/bookings/${bookingId}/payment-proof`,
      dto
    )
    return unwrapApiResponse(response.data)
  },

  cancelMyBooking: async function (bookingId: string): Promise<{ id: string; status: string; cancelReason: string | null; updatedAt: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<
      ApiResponse<{ id: string; status: string; cancelReason: string | null; updatedAt: string }> |
      { id: string; status: string; cancelReason: string | null; updatedAt: string }
    >(`/api/learner/bookings/${bookingId}`)
    return unwrapApiResponse(response.data)
  },

  // ===================== Private Bookings - Coach Actions =====================

  listIncomingBookings: async function (params?: {
    status?: string
    from?: string
    to?: string
    page?: number
    limit?: number
  }): Promise<{ data: Booking[]; meta: PaginationMeta }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<{ data: Booking[]; meta: PaginationMeta }>("/api/coach/bookings", { params })
    return response.data
  },

  confirmBooking: async function (bookingId: string, dto?: { coachNote?: string }): Promise<Booking> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Booking> | Booking>(
      `/api/coach/bookings/${bookingId}/confirm`,
      dto ?? {}
    )
    return unwrapApiResponse(response.data)
  },

  rejectBooking: async function (bookingId: string, dto?: { cancelReason?: string }): Promise<Booking> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Booking> | Booking>(
      `/api/coach/bookings/${bookingId}/reject`,
      dto ?? {}
    )
    return unwrapApiResponse(response.data)
  },

  settleBookingPayment: async function (bookingId: string): Promise<Booking> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Booking> | Booking>(
      `/api/coach/bookings/${bookingId}/settle-payment`
    )
    return unwrapApiResponse(response.data)
  },

  completeBooking: async function (bookingId: string): Promise<Booking> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Booking> | Booking>(
      `/api/coach/bookings/${bookingId}/complete`
    )
    return unwrapApiResponse(response.data)
  },

  rejectBookingPayment: async function (bookingId: string): Promise<Booking> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Booking> | Booking>(
      `/api/coach/bookings/${bookingId}/reject-payment`
    )
    return unwrapApiResponse(response.data)
  },

  cancelBooking: async function (bookingId: string, dto?: { cancelReason?: string }): Promise<Booking> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<Booking> | Booking>(
      `/api/coach/bookings/${bookingId}`,
      { data: dto ?? {} }
    )
    return unwrapApiResponse(response.data)
  },

  // ===================== Learning Schedule - Learner =====================

  getLearnerSchedule: async function (params?: {
    kind?: string
    state?: string
    coachProfileId?: string
    classId?: string
    from?: string
    to?: string
    page?: number
    limit?: number
    sort?: string
  }): Promise<{
    success: boolean
    data: import("../types/coach").LearnerScheduleItem[]
    pagination: PaginationMeta
    summary: { total: number; classCount: number; bookingCount: number; upcomingCount: number; liveCount: number; pastCount: number; pendingCount: number }
    filters: { coachProfiles: { coachProfileId: string; name: string }[]; classes: { classId: string; title: string }[] }
  }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<{
      success: boolean
      data: import("../types/coach").LearnerScheduleItem[]
      pagination: PaginationMeta
      summary: { total: number; classCount: number; bookingCount: number; upcomingCount: number; liveCount: number; pastCount: number; pendingCount: number }
      filters: { coachProfiles: { coachProfileId: string; name: string }[]; classes: { classId: string; title: string }[] }
    }>("/api/learner/schedule", { params })
    return response.data
  },
}
