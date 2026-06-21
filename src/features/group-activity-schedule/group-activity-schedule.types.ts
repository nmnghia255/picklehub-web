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
}

export interface CreateGroupActivityDto {
  title: string
  description: string
  location: string
  activityType: ActivityType
  startAt: string
  endAt: string
  remindAt?: string
}

export interface UpdateGroupActivityDto extends Partial<CreateGroupActivityDto> {
  status?: GroupActivityStatus
}

export interface ListActivitiesParams {
  page?: number
  limit?: number
  type?: "upcoming" | "past"
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
}
