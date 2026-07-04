export const coachQueryKeys = {
  all: ["coach"] as const,
  profiles: () => [...coachQueryKeys.all, "profiles"] as const,
  profile: (id: string) => [...coachQueryKeys.profiles(), id] as const,
  myProfile: () => [...coachQueryKeys.all, "my-profile"] as const,
  coaches: (params?: Record<string, unknown>) =>
    params !== undefined
      ? ([...coachQueryKeys.all, "coaches", params] as const)
      : ([...coachQueryKeys.all, "coaches"] as const),
  coach: (id: string) => [...coachQueryKeys.all, "coach", id] as const,
  classes: (coachId?: string) =>
    coachId !== undefined
      ? ([...coachQueryKeys.all, "classes", coachId] as const)
      : ([...coachQueryKeys.all, "classes"] as const),
  myClasses: (params?: Record<string, unknown>) =>
    params !== undefined
      ? ([...coachQueryKeys.all, "my-classes", params] as const)
      : ([...coachQueryKeys.all, "my-classes"] as const),
  myClass: (classId: string) => [...coachQueryKeys.all, "my-class", classId] as const,
  discoverClasses: (params?: Record<string, unknown>) =>
    params !== undefined
      ? ([...coachQueryKeys.all, "discover-classes", params] as const)
      : ([...coachQueryKeys.all, "discover-classes"] as const),
  classDetail: (classId: string) => [...coachQueryKeys.all, "class-detail", classId] as const,
  schedule: (params?: Record<string, unknown>) =>
    params !== undefined
      ? ([...coachQueryKeys.all, "schedule", params] as const)
      : ([...coachQueryKeys.all, "schedule"] as const),
  certifications: () => [...coachQueryKeys.all, "certifications"] as const,
  learners: (params?: Record<string, unknown>) =>
    params !== undefined
      ? ([...coachQueryKeys.all, "learners", params] as const)
      : ([...coachQueryKeys.all, "learners"] as const),
  learnerDashboard: () => [...coachQueryKeys.all, "learner-dashboard"] as const,
  learner: (learnerId: string) => [...coachQueryKeys.all, "learner", learnerId] as const,
  enrollments: (classId: string) => [...coachQueryKeys.all, "enrollments", classId] as const,
  reviews: (coachId: string) => [...coachQueryKeys.all, "reviews", coachId] as const,
  revenueSummary: (params?: Record<string, unknown>) =>
    params !== undefined
      ? ([...coachQueryKeys.all, "revenue-summary", params] as const)
      : ([...coachQueryKeys.all, "revenue-summary"] as const),
  classRevenue: (params?: Record<string, unknown>) =>
    params !== undefined
      ? ([...coachQueryKeys.all, "class-revenue", params] as const)
      : ([...coachQueryKeys.all, "class-revenue"] as const),
  bookingRevenue: (params?: Record<string, unknown>) =>
    params !== undefined
      ? ([...coachQueryKeys.all, "booking-revenue", params] as const)
      : ([...coachQueryKeys.all, "booking-revenue"] as const),
  bookings: (params?: Record<string, unknown>) =>
    params !== undefined
      ? ([...coachQueryKeys.all, "bookings", params] as const)
      : ([...coachQueryKeys.all, "bookings"] as const),
  myBookings: (params?: Record<string, unknown>) =>
    params !== undefined
      ? ([...coachQueryKeys.all, "my-bookings", params] as const)
      : ([...coachQueryKeys.all, "my-bookings"] as const),
  myEnrollments: () => [...coachQueryKeys.all, "my-enrollments"] as const,
}

export const learnerQueryKeys = {
  all: ["learner"] as const,
  schedule: (params?: Record<string, unknown>) =>
    params !== undefined
      ? ([...learnerQueryKeys.all, "schedule", params] as const)
      : ([...learnerQueryKeys.all, "schedule"] as const),
  enrollments: () => [...learnerQueryKeys.all, "enrollments"] as const,
  bookings: (params?: Record<string, unknown>) =>
    params !== undefined
      ? ([...learnerQueryKeys.all, "bookings", params] as const)
      : ([...learnerQueryKeys.all, "bookings"] as const),
}
