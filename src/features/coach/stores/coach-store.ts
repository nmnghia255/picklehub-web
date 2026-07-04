"use client"

import { create } from "zustand"

import type {
  Booking,
  CoachClass,
  CoachLearner,
  CoachProfile,
  Enrollment,
  PaginationMeta,
} from "../types/coach"

interface CoachStore {
  myProfile: CoachProfile | null
  coachClasses: CoachClass[]
  selectedClass: CoachClass | null
  learners: CoachLearner[]
  learnersPagination: PaginationMeta | null
  learnersSearch: string
  bookings: Booking[]
  bookingsPagination: PaginationMeta | null
  activeBookingTab: string
  enrollments: Enrollment[]
  activeClassTab: string
  loading: boolean

  setMyProfile: (profile: CoachProfile | null) => void
  setCoachClasses: (classes: CoachClass[]) => void
  setSelectedClass: (cls: CoachClass | null) => void
  setLearners: (learners: CoachLearner[]) => void
  setLearnersPagination: (pagination: PaginationMeta | null) => void
  setLearnersSearch: (search: string) => void
  setBookings: (bookings: Booking[]) => void
  setBookingsPagination: (pagination: PaginationMeta | null) => void
  setActiveBookingTab: (tab: string) => void
  setEnrollments: (enrollments: Enrollment[]) => void
  setActiveClassTab: (tab: string) => void
  setLoading: (loading: boolean) => void
}

export const useCoachStore = create<CoachStore>((set) => ({
  myProfile: null,
  coachClasses: [],
  selectedClass: null,
  learners: [],
  learnersPagination: null,
  learnersSearch: "",
  bookings: [],
  bookingsPagination: null,
  activeBookingTab: "all",
  enrollments: [],
  activeClassTab: "all",
  loading: false,

  setMyProfile: (profile) => set({ myProfile: profile }),
  setCoachClasses: (classes) => set({ coachClasses: classes }),
  setSelectedClass: (cls) => set({ selectedClass: cls }),
  setLearners: (learners) => set({ learners }),
  setLearnersPagination: (pagination) => set({ learnersPagination: pagination }),
  setLearnersSearch: (search) => set({ learnersSearch: search }),
  setBookings: (bookings) => set({ bookings }),
  setBookingsPagination: (pagination) => set({ bookingsPagination: pagination }),
  setActiveBookingTab: (tab) => set({ activeBookingTab: tab }),
  setEnrollments: (enrollments) => set({ enrollments }),
  setActiveClassTab: (tab) => set({ activeClassTab: tab }),
  setLoading: (loading) => set({ loading }),
}))
