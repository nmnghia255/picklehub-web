export type ActivityType =
  | "PRACTICE"
  | "MEETUP"
  | "INTERNAL_MATCH"
  | "MEETING"
  | "OTHER"

export type GroupActivityStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED"

export type CalendarView = "month" | "week" | "agenda"
export type PeriodFilter = "today" | "week" | "month"
export type ActivityTypeFilter = ActivityType | "all"

export type AttendanceStatus = "ATTENDING" | "ABSENT"

/** Snapshot thông tin sân được nhúng trực tiếp trong activity response */
export interface CourtBookingSnapshot {
  id: string
  title?: string | null
  centerName: string
  date: string
  startTime: string
  endTime: string
}

export interface ActivityAttendance {
  id: string
  activityId: string
  memberId: string
  status: AttendanceStatus
  guestCount: number
  guestStatus: "PENDING" | "APPROVED" | "REJECTED" | null
  pendingGuestCount?: number | null
  member?: {
    userId: string
    name: string
    email: string
  }
}

export interface GroupActivity {
  id: string
  groupId: string
  title: string
  description: string
  location: string
  activityType: ActivityType
  startAt: string
  endAt: string
  remindAt?: string
  status: GroupActivityStatus
  createdAt: string
  updatedAt: string
  equipment?: { name: string; quantity: number }[]
  bookingId?: string | null
  courtBookingId?: string | null
  cancellationDeadlineHours?: number
  attendance?: ActivityAttendance[]
  myAttendance?: ActivityAttendance | null
  /** Số thành viên đang tham gia (= tổng thành viên - số người báo vắng ABSENT) */
  attendingMemberCount?: number
  /** Tổng số khách đã được duyệt (guestStatus = APPROVED) từ tất cả thành viên */
  attendingGuestCount?: number
  /** Thông tin sân liên kết đầy đủ, null nếu chưa liên kết */
  courtBooking?: CourtBookingSnapshot | null
  hasExpense?: boolean
  expense?: { id: string; title: string; totalAmount: number } | null
}

export interface CreateGroupActivityDto {
  title: string
  description: string
  location: string
  activityType: ActivityType
  startAt: string
  endAt: string
  remindAt?: string
  courtBookingId?: string | null
}

export interface UpdateGroupActivityDto extends Partial<CreateGroupActivityDto> {
  status?: GroupActivityStatus
}

export interface ListActivitiesParams {
  page?: number
  limit?: number
  type?: "upcoming" | "past"
  hasExpense?: boolean
}

export interface PaginatedActivitiesResponse {
  data: GroupActivity[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Keeping these for now if they are used for UI context, but they will likely be removed or replaced by real APIs
export interface GroupActivityGroup {
  id: string
  name: string
  description: string
  avatarFallback: string
  memberCount: number
}

// Form values for the UI
export interface EventFormValues {
  title: string
  activityType: ActivityType
  date: string
  startTime: string
  endTime: string
  location: string
  description: string
  remindAt?: string
  status: GroupActivityStatus
  courtBookingId?: string | null
}
