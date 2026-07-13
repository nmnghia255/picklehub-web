"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { CoachClient } from "../api/coach-client"
import { coachQueryKeys, learnerQueryKeys } from "../api/query-keys"
import type * as CoachTypes from "../types/coach"
import { mapDiscoverClass } from "../utils/mappers/discover-class-mapper"

export function useCoachList(params?: {
  city?: string
  level?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: coachQueryKeys.coaches(params),
    queryFn: () => CoachClient.listCoaches(params),
  })
}

export function useCoachPublicProfile(coachId: string) {
  return useQuery({
    queryKey: coachQueryKeys.coach(coachId),
    queryFn: () => CoachClient.getCoachPublicProfile(coachId),
    enabled: !!coachId,
  })
}

export function useDiscoverClasses(params?: {
  city?: string
  level?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: coachQueryKeys.discoverClasses(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await CoachClient.discoverOpenClasses(params)
      return {
        data: res.data.map(mapDiscoverClass),
        meta: res.meta,
      }
    },
  })
}

export function useClassDetail(classId: string) {
  return useQuery({
    queryKey: coachQueryKeys.classDetail(classId),
    queryFn: async () => {
      const dto = await CoachClient.getClassPublicDetail(classId)
      return mapDiscoverClass(dto)
    },
    enabled: !!classId,
  })
}

export function useCoachOpenClasses(coachId: string) {
  return useQuery({
    queryKey: coachQueryKeys.classes(coachId),
    queryFn: () => CoachClient.listCoachOpenClasses(coachId),
    enabled: !!coachId,
  })
}

export function useMyCoachProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: coachQueryKeys.myProfile(),
    queryFn: () => CoachClient.getMyCoachProfile(),
    enabled: options?.enabled ?? true,
  })
}

interface CoachProfileState {
  profile: CoachTypes.CoachProfile | null
  isLoading: boolean
  exists: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export function useCoachProfile(options?: {
  enabled?: boolean
}): CoachProfileState {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: coachQueryKeys.myProfile(),
    queryFn: () => CoachClient.getMyCoachProfile(),
    enabled: options?.enabled ?? true,
    retry: (failureCount, err) => {
      if (
        err instanceof Error &&
        err.message.includes("Coach profile not found")
      )
        return false
      return failureCount < 3
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const exists = data !== null && data !== undefined

  return {
    profile: data ?? null,
    isLoading,
    exists,
    isError,
    error: error instanceof Error ? error : null,
    refetch: () => {
      queryRefetch()
    },
  }
}

export function useRegisterAsCoach() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.registerAsCoach,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myProfile() })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.all })
    },
  })
}

export function useUpdateMyCoachProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.updateMyCoachProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myProfile() })
    },
  })
}

export function usePublishMyProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.publishMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myProfile() })
    },
  })
}

export function useMyCertifications(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: coachQueryKeys.certifications(),
    queryFn: () => CoachClient.listMyCertifications(),
    enabled: options?.enabled ?? true,
  })
}

export function useAddCertification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.addCertification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: coachQueryKeys.certifications(),
      })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myProfile() })
    },
  })
}

export function useDeleteCertification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.deleteCertification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: coachQueryKeys.certifications(),
      })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myProfile() })
    },
  })
}

export function useCoachSchedule(
  params?: Record<string, unknown>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: coachQueryKeys.schedule(params),
    queryFn: () => CoachClient.getCoachSchedule(params),
    enabled: options?.enabled ?? true,
  })
}

export function useMyClasses(
  params?: {
    status?: string
    level?: string
    from?: string
    to?: string
    page?: number
    limit?: number
  },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: coachQueryKeys.myClasses(params),
    queryFn: () => CoachClient.listMyClasses(params),
    enabled: options?.enabled ?? true,
  })
}

export function useMyClassDetail(
  classId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: coachQueryKeys.myClass(classId),
    queryFn: () => CoachClient.getMyClassDetail(classId),
    enabled: !!classId && (options?.enabled ?? true),
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClasses() })
    },
  })
}

export function useUpdateClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      classId,
      dto,
    }: {
      classId: string
      dto: CoachTypes.UpdateCoachClassDto
    }) => CoachClient.updateClass(classId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClasses() })
      queryClient.invalidateQueries({
        queryKey: coachQueryKeys.myClass(variables.classId),
      })
    },
  })
}

export function usePublishClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.publishClass,
    onSuccess: (_data, classId) => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClasses() })
      queryClient.invalidateQueries({
        queryKey: coachQueryKeys.myClass(classId),
      })
      queryClient.invalidateQueries({
        queryKey: coachQueryKeys.discoverClasses(),
      })
      queryClient.invalidateQueries({
        queryKey: coachQueryKeys.classDetail(classId),
      })
    },
  })
}

export function useCancelClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.cancelClass,
    onSuccess: (_data, classId) => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClasses() })
      queryClient.invalidateQueries({
        queryKey: coachQueryKeys.myClass(classId),
      })
      queryClient.invalidateQueries({
        queryKey: coachQueryKeys.discoverClasses(),
      })
      queryClient.invalidateQueries({
        queryKey: coachQueryKeys.classDetail(classId),
      })
    },
  })
}

export function useClassScheduleEntries(
  classId: string,
  params?: { from?: string; to?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...coachQueryKeys.myClass(classId), "schedules", params],
    queryFn: () => CoachClient.listScheduleEntries(classId, params),
    enabled: !!classId && (options?.enabled ?? true),
  })
}

export function useAddScheduleSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      classId,
      dto,
    }: {
      classId: string
      dto: CoachTypes.CreateClassScheduleDto
    }) => CoachClient.addScheduleSlot(classId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClasses() })
      queryClient.invalidateQueries({
        queryKey: [...coachQueryKeys.myClass(variables.classId), "schedules"],
      })
    },
  })
}

export function useRemoveScheduleSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      classId,
      scheduleId,
    }: {
      classId: string
      scheduleId: string
    }) => CoachClient.removeScheduleSlot(classId, scheduleId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClasses() })
      queryClient.invalidateQueries({
        queryKey: [...coachQueryKeys.myClass(variables.classId), "schedules"],
      })
    },
  })
}

export function useUpdateClassScheduleLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      classId,
      scheduleId,
      dto,
    }: {
      classId: string
      scheduleId: string
      dto: CoachTypes.UpdateClassScheduleLocationDto
    }) => CoachClient.updateClassScheduleLocation(classId, scheduleId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClasses() })
      queryClient.invalidateQueries({
        queryKey: [...coachQueryKeys.myClass(variables.classId), "schedules"],
      })
    },
  })
}

export function useClassEnrollments(
  classId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: coachQueryKeys.enrollments(classId),
    queryFn: () => CoachClient.viewClassEnrollments(classId),
    enabled: !!classId && (options?.enabled ?? true),
  })
}

export function useSettleEnrollmentPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      classId,
      enrollmentId,
    }: {
      classId: string
      enrollmentId: string
    }) => CoachClient.settleEnrollmentPayment(classId, enrollmentId),
    onSuccess: (_data, { classId }) => {
      queryClient.invalidateQueries({
        queryKey: [...coachQueryKeys.all, "enrollments"],
      })
      queryClient.invalidateQueries({
        queryKey: learnerQueryKeys.enrollments(),
      })
      queryClient.invalidateQueries({
        queryKey: learnerQueryKeys.schedule(),
      })
      queryClient.invalidateQueries({
        queryKey: coachQueryKeys.classDetail(classId),
      })
    },
  })
}

export function useRejectEnrollmentPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      classId,
      enrollmentId,
      reason,
    }: {
      classId: string
      enrollmentId: string
      reason?: string
    }) =>
      CoachClient.rejectEnrollmentPayment(classId, enrollmentId, { reason }),
    onSuccess: (_data, { classId }) => {
      queryClient.invalidateQueries({
        queryKey: [...coachQueryKeys.all, "enrollments"],
      })
      queryClient.invalidateQueries({
        queryKey: learnerQueryKeys.enrollments(),
      })
      queryClient.invalidateQueries({
        queryKey: learnerQueryKeys.schedule(),
      })
      queryClient.invalidateQueries({
        queryKey: coachQueryKeys.classDetail(classId),
      })
    },
  })
}

export function useCoachLearners(
  params?: {
    search?: string
    kind?: string
    page?: number
    limit?: number
  },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: coachQueryKeys.learners(params),
    queryFn: () => CoachClient.listLearners(params),
    enabled: options?.enabled ?? true,
  })
}

export function useCoachLearnerDashboard(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: coachQueryKeys.learnerDashboard(),
    queryFn: () => CoachClient.getLearnerDashboard(),
    enabled: options?.enabled ?? true,
  })
}

export function useCoachLearnerDetail(
  learnerId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: coachQueryKeys.learner(learnerId),
    queryFn: () => CoachClient.getLearnerDetail(learnerId),
    enabled: !!learnerId && (options?.enabled ?? true),
  })
}

export function useCoachReviews(coachId: string) {
  return useQuery({
    queryKey: coachQueryKeys.reviews(coachId),
    queryFn: () => CoachClient.getCoachReviews(coachId),
    enabled: !!coachId,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      coachId,
      dto,
    }: {
      coachId: string
      dto: CoachTypes.CreateReviewDto
    }) => CoachClient.createReview(coachId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...coachQueryKeys.all, "reviews"],
      })
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      coachId,
      reviewId,
      dto,
    }: {
      coachId: string
      reviewId: string
      dto: CoachTypes.UpdateReviewDto
    }) => CoachClient.updateReview(coachId, reviewId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...coachQueryKeys.all, "reviews"],
      })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      coachId,
      reviewId,
    }: {
      coachId: string
      reviewId: string
    }) => CoachClient.deleteReview(coachId, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...coachQueryKeys.all, "reviews"],
      })
    },
  })
}

export function useRecommendCoach() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      coachId,
      dto,
    }: {
      coachId: string
      dto: CoachTypes.CreateRecommendationDto
    }) => CoachClient.recommendCoach(coachId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...coachQueryKeys.all, "reviews"],
      })
    },
  })
}

export function useRevenueSummary(
  params?: { period?: string; year?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: coachQueryKeys.revenueSummary(params),
    queryFn: () => CoachClient.getRevenueSummary(params),
    enabled: options?.enabled ?? true,
  })
}

export function useClassRevenue(
  params?: { page?: number; limit?: number; from?: string; to?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: coachQueryKeys.classRevenue(params),
    queryFn: () => CoachClient.getClassRevenue(params),
    ...options,
  })
}

export function useBookingRevenue(
  params?: { page?: number; limit?: number; from?: string; to?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: coachQueryKeys.bookingRevenue(params),
    queryFn: () => CoachClient.getBookingRevenue(params),
    ...options,
  })
}

export function useIncomingBookings(
  params?: {
    status?: string
    from?: string
    to?: string
    page?: number
    limit?: number
  },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: coachQueryKeys.bookings(params),
    queryFn: () => CoachClient.listIncomingBookings(params),
    enabled: options?.enabled ?? true,
  })
}

export function useConfirmBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      bookingId,
      coachNote,
    }: {
      bookingId: string
      coachNote?: string
    }) => CoachClient.confirmBooking(bookingId, { coachNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.schedule() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.schedule() })
    },
  })
}

export function useRejectBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      bookingId,
      cancelReason,
    }: {
      bookingId: string
      cancelReason?: string
    }) => CoachClient.rejectBooking(bookingId, { cancelReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.schedule() })
    },
  })
}

export function useSettleBookingPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.settleBookingPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.schedule() })
    },
  })
}

export function useCompleteBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.completeBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.schedule() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.schedule() })
    },
  })
}

export function useRejectBookingPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.rejectBookingPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.schedule() })
    },
  })
}

export function useCancelBookingCoach() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      bookingId,
      cancelReason,
    }: {
      bookingId: string
      cancelReason?: string
    }) => CoachClient.cancelBooking(bookingId, { cancelReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.schedule() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.schedule() })
    },
  })
}

export function useUpdateBookingLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      bookingId,
      dto,
    }: {
      bookingId: string
      dto: CoachTypes.UpdateBookingLocationDto
    }) => CoachClient.updateBookingLocation(bookingId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.schedule() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.schedule() })
    },
  })
}
