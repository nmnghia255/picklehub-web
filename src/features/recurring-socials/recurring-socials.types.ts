// Types for Recurring Socials feature

export type RecurrenceType = "weekly" | "monthly" | "quarterly"
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"
export type MonthPosition = "first" | "second" | "third" | "fourth" | "last"
export type RecurringStatus = "active" | "paused" | "expired"

export interface RecurringSocialTemplate {
  id: string
  name: string
  description: string
  socialType: string
  skillLevel: string
  startTime: string // HH:mm format
  endTime: string
  courts: Court[]
  maxParticipants: number
  maxPerCourt: number
  maxWaitlist: number
  fee: number
  courtRentFee: number
  costNote: string
  recurrenceType: RecurrenceType

  // Weekly specific
  daysOfWeek?: DayOfWeek[]

  // Monthly specific
  dayOfMonth?: number
  monthPosition?: MonthPosition
  dayOfWeek?: DayOfWeek

  // Quarterly specific
  quarterStartMonth?: number // 1, 4, 7, 10
  quarterDay?: number

  startDate: string // YYYY-MM-DD
  endDate: string

  status: RecurringStatus
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Court {
  id: string
  name: string
  capacity: number
}

export interface SchedulePreview {
  date: string // YYYY-MM-DD
  dayName: string
  startTime: string
  endTime: string
  courts: number
  totalCapacity: number
}

export interface RecurringSocialFormData {
  // Basic Info
  name: string
  description: string
  socialType: string
  skillLevel: string

  // Time
  startTime: string
  endTime: string

  // Recurrence
  recurrenceType: RecurrenceType
  daysOfWeek?: DayOfWeek[]
  dayOfMonth?: number
  monthPosition?: MonthPosition
  quarterStartMonth?: number
  quarterDay?: number

  // Dates
  startDate: string
  endDate: string

  // Courts
  selectedCourts: Court[]

  // Capacity
  maxParticipants: number
  maxPerCourt: number
  maxWaitlist: number

  // Costs
  fee: number
  courtRentFee: number
  costNote: string
}

export interface ConfirmData {
  totalSchedules: number
  dateRange: string
  previewSchedules: SchedulePreview[]
}
