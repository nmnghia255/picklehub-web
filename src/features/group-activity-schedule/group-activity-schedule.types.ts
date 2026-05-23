export type ActivityType =
  | "CHOI_THUONG"
  | "SOCIAL"
  | "GIAI_DAU"
  | "THUE_SAN_GIAO_LUU"
  | "MEETUP"

export type EventStatus =
  | "SAP_DIEN_RA"
  | "DANG_DIEN_RA"
  | "DA_KET_THUC"
  | "DA_HUY"

export type CalendarView = "month" | "week" | "agenda"
export type PeriodFilter = "today" | "week" | "month"
export type ActivityTypeFilter = ActivityType | "all"

export interface GroupActivityGroup {
  id: string
  name: string
  description: string
  avatarFallback: string
  memberCount: number
}

export interface GroupMember {
  id: string
  groupId: string
  name: string
  email: string
  phone: string
  level: string
  avatarFallback: string
}

export interface Venue {
  id: string
  groupId: string
  name: string
  shortLabel: string
  address: string
}

export interface GroupEvent {
  id: string
  groupId: string
  groupName: string
  title: string
  activityType: ActivityType
  status: EventStatus
  startAt: string
  endAt: string
  venueId: string
  description: string
  createdById: string
  participantIds: string[]
  createdAt: string
  updatedAt: string
  updatedById: string
}

export interface EventFormValues {
  title: string
  activityType: ActivityType
  date: string
  startTime: string
  endTime: string
  venueId: string
  description: string
  createdById: string
  status: EventStatus
}
