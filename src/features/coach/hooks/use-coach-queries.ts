"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type * as CoachTypes from "../types/coach"
import { CoachClient } from "../api/coach-client"
import { coachQueryKeys } from "../api/query-keys"

export function useCoachList(params?: { city?: string; level?: string; page?: number; limit?: number }) {
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

export function useCoachOpenClasses(coachId: string) {
  return useQuery({
    queryKey: coachQueryKeys.classes(coachId),
    queryFn: () => CoachClient.listCoachOpenClasses(coachId),
    enabled: !!coachId,
  })
}

export function useMyCoachProfile() {
  return useQuery({
    queryKey: coachQueryKeys.myProfile(),
    queryFn: () => CoachClient.getMyCoachProfile(),
  })
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

export function useMyCertifications() {
  return useQuery({
    queryKey: coachQueryKeys.certifications(),
    queryFn: () => CoachClient.listMyCertifications(),
  })
}

export function useAddCertification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.addCertification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.certifications() })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myProfile() })
    },
  })
}

export function useDeleteCertification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.deleteCertification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.certifications() })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myProfile() })
    },
  })
}

export function useAdminCertifications(params?: { verificationStatus?: string; coachProfileId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...coachQueryKeys.all, "admin-certifications", params],
    queryFn: () => CoachClient.adminListCertifications(params),
  })
}

export function useAdminPendingCertifications() {
  return useQuery({
    queryKey: [...coachQueryKeys.all, "admin-pending-certifications"],
    queryFn: () => CoachClient.adminListPendingCertifications(),
  })
}

export function useAdminReviewCertification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ certId, dto }: { certId: string; dto: { verificationStatus: "VERIFIED" | "REJECTED"; reviewNote?: string } }) =>
      CoachClient.adminReviewCertification(certId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...coachQueryKeys.all, "admin-certifications"] })
      queryClient.invalidateQueries({ queryKey: [...coachQueryKeys.all, "admin-pending-certifications"] })
    },
  })
}

export function useCoachSchedule(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: coachQueryKeys.schedule(params),
    queryFn: () => CoachClient.getCoachSchedule(params),
  })
}

export function useMyClasses(params?: { status?: string; level?: string; from?: string; to?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: coachQueryKeys.myClasses(params),
    queryFn: () => CoachClient.listMyClasses(params),
  })
}

export function useMyClassDetail(classId: string) {
  return useQuery({
    queryKey: coachQueryKeys.myClass(classId),
    queryFn: () => CoachClient.getMyClassDetail(classId),
    enabled: !!classId,
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
    mutationFn: ({ classId, dto }: { classId: string; dto: CoachTypes.UpdateCoachClassDto }) =>
      CoachClient.updateClass(classId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClasses() })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClass(variables.classId) })
    },
  })
}

export function usePublishClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.publishClass,
    onSuccess: (_data, classId) => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClasses() })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClass(classId) })
    },
  })
}

export function useCancelClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.cancelClass,
    onSuccess: (_data, classId) => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClasses() })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClass(classId) })
    },
  })
}

export function useClassScheduleEntries(classId: string, params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [...coachQueryKeys.myClass(classId), "schedules", params],
    queryFn: () => CoachClient.listScheduleEntries(classId, params),
    enabled: !!classId,
  })
}

export function useAddScheduleSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ classId, dto }: { classId: string; dto: CoachTypes.CreateClassScheduleDto }) =>
      CoachClient.addScheduleSlot(classId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClasses() })
      queryClient.invalidateQueries({ queryKey: [...coachQueryKeys.myClass(variables.classId), "schedules"] })
    },
  })
}

export function useRemoveScheduleSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ classId, scheduleId }: { classId: string; scheduleId: string }) =>
      CoachClient.removeScheduleSlot(classId, scheduleId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClasses() })
      queryClient.invalidateQueries({ queryKey: [...coachQueryKeys.myClass(variables.classId), "schedules"] })
    },
  })
}

export function useClassEnrollments(classId: string) {
  return useQuery({
    queryKey: coachQueryKeys.enrollments(classId),
    queryFn: () => CoachClient.viewClassEnrollments(classId),
    enabled: !!classId,
  })
}

export function useSettleEnrollmentPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ classId, enrollmentId }: { classId: string; enrollmentId: string }) =>
      CoachClient.settleEnrollmentPayment(classId, enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...coachQueryKeys.all, "enrollments"] })
    },
  })
}

export function useRejectEnrollmentPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ classId, enrollmentId, reason }: { classId: string; enrollmentId: string; reason?: string }) =>
      CoachClient.rejectEnrollmentPayment(classId, enrollmentId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...coachQueryKeys.all, "enrollments"] })
    },
  })
}

export function useCoachLearners(params?: { search?: string; kind?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: coachQueryKeys.learners(params),
    queryFn: () => CoachClient.listLearners(params),
  })
}

export function useCoachLearnerDashboard() {
  return useQuery({
    queryKey: coachQueryKeys.learnerDashboard(),
    queryFn: () => CoachClient.getLearnerDashboard(),
  })
}

export function useCoachLearnerDetail(learnerId: string) {
  return useQuery({
    queryKey: coachQueryKeys.learner(learnerId),
    queryFn: () => CoachClient.getLearnerDetail(learnerId),
    enabled: !!learnerId,
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
    mutationFn: ({ coachId, dto }: { coachId: string; dto: CoachTypes.CreateReviewDto }) =>
      CoachClient.createReview(coachId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...coachQueryKeys.all, "reviews"] })
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ coachId, reviewId, dto }: { coachId: string; reviewId: string; dto: CoachTypes.UpdateReviewDto }) =>
      CoachClient.updateReview(coachId, reviewId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...coachQueryKeys.all, "reviews"] })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ coachId, reviewId }: { coachId: string; reviewId: string }) =>
      CoachClient.deleteReview(coachId, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...coachQueryKeys.all, "reviews"] })
    },
  })
}

export function useRecommendCoach() {
  return useMutation({
    mutationFn: ({ coachId, dto }: { coachId: string; dto: CoachTypes.CreateRecommendationDto }) =>
      CoachClient.recommendCoach(coachId, dto),
  })
}

export function useRevenueSummary(params?: { period?: string; year?: number }) {
  return useQuery({
    queryKey: coachQueryKeys.revenueSummary(params),
    queryFn: () => CoachClient.getRevenueSummary(params),
  })
}

export function useClassRevenue(params?: { page?: number; limit?: number; from?: string; to?: string }) {
  return useQuery({
    queryKey: coachQueryKeys.classRevenue(params),
    queryFn: () => CoachClient.getClassRevenue(params),
  })
}

export function useBookingRevenue(params?: { page?: number; limit?: number; from?: string; to?: string }) {
  return useQuery({
    queryKey: coachQueryKeys.bookingRevenue(params),
    queryFn: () => CoachClient.getBookingRevenue(params),
  })
}

export function useIncomingBookings(params?: { status?: string; from?: string; to?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: coachQueryKeys.bookings(params),
    queryFn: () => CoachClient.listIncomingBookings(params),
  })
}

export function useConfirmBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, coachNote }: { bookingId: string; coachNote?: string }) =>
      CoachClient.confirmBooking(bookingId, { coachNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.schedule() })
    },
  })
}

export function useRejectBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, cancelReason }: { bookingId: string; cancelReason?: string }) =>
      CoachClient.rejectBooking(bookingId, { cancelReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.bookings() })
    },
  })
}

export function useSettleBookingPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.settleBookingPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.bookings() })
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
    },
  })
}

export function useRejectBookingPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.rejectBookingPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.bookings() })
    },
  })
}

export function useCancelBookingCoach() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, cancelReason }: { bookingId: string; cancelReason?: string }) =>
      CoachClient.cancelBooking(bookingId, { cancelReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.schedule() })
    },
  })
}
