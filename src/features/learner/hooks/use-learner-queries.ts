"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type * as CoachTypes from "@/features/coach/types/coach"
import { coachQueryKeys, learnerQueryKeys } from "@/features/coach/api/query-keys"
import { CoachClient } from "@/features/coach/api/coach-client"

// ===================== Learner Schedule =====================

export function useLearnerSchedule(params?: {
  kind?: string
  state?: string
  coachProfileId?: string
  classId?: string
  from?: string
  to?: string
  page?: number
  limit?: number
  sort?: string
}) {
  return useQuery({
    queryKey: learnerQueryKeys.schedule(params),
    queryFn: () => CoachClient.getLearnerSchedule(params),
  })
}

// ===================== Learner Enrollments =====================

export function useMyEnrollments() {
  return useQuery({
    queryKey: learnerQueryKeys.enrollments(),
    queryFn: () => CoachClient.listMyEnrollments(),
  })
}

export function useEnrollInClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.enrollInClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.enrollments() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.schedule() })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.discoverClasses() })
    },
  })
}

export function useUploadEnrollmentPaymentProof() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ enrollmentId, paymentProofUrl }: { enrollmentId: string; paymentProofUrl: string }) =>
      CoachClient.uploadEnrollmentPaymentProof(enrollmentId, { paymentProofUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.enrollments() })
    },
  })
}

export function useCancelEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.cancelEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.enrollments() })
      queryClient.invalidateQueries({ queryKey: coachQueryKeys.discoverClasses() })
    },
  })
}

// ===================== Learner Bookings =====================

export function useMyBookings(params?: { status?: string; from?: string; to?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: learnerQueryKeys.bookings(params),
    queryFn: () => CoachClient.listMyBookings(params),
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ coachId, dto }: { coachId: string; dto: CoachTypes.CreateBookingDto }) =>
      CoachClient.createBooking(coachId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.schedule() })
    },
  })
}

export function useUploadBookingPaymentProof() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, paymentProofUrl }: { bookingId: string; paymentProofUrl: string }) =>
      CoachClient.uploadBookingPaymentProof(bookingId, { paymentProofUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.bookings() })
    },
  })
}

export function useCancelMyBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CoachClient.cancelMyBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.bookings() })
      queryClient.invalidateQueries({ queryKey: learnerQueryKeys.schedule() })
    },
  })
}
