import type { GroupCourtBooking } from "@/features/groups/types/court-booking"

import type {
  ActivityCalendarEvent,
  ActivityType,
  ActivityTypeFilter,
  CalendarEvent,
  CourtBookingCalendarEvent,
  EventFormValues,
  GroupActivity,
  GroupActivityStatus,
  PeriodFilter,
} from "./group-activity-schedule.types"

const DAY_IN_MS = 24 * 60 * 60 * 1000

export function transformActivityToCalendarEvent(
  activity: GroupActivity
): ActivityCalendarEvent {
  return {
    type: "activity",
    id: activity.id,
    title: activity.title,
    startAt: activity.startAt,
    endAt: activity.endAt,
    groupId: activity.groupId,
    _raw: activity,
  }
}

function computeTimeRange(snapshots: { startTime: string; endTime: string }[]) {
  const startTimes = snapshots
    .map((s) => s.startTime)
    .filter(Boolean) as string[]
  const endTimes = snapshots.map((s) => s.endTime).filter(Boolean) as string[]

  const startTime =
    startTimes.length > 0
      ? startTimes.reduce((min, t) => (t < min ? t : min))
      : ""
  const endTime =
    endTimes.length > 0 ? endTimes.reduce((max, t) => (t > max ? t : max)) : ""

  return { startTime, endTime }
}

function computeCourtNames(snapshots: { courtName: string }[]) {
  return [
    ...new Set(snapshots.map((s) => s.courtName).filter(Boolean) as string[]),
  ]
}

export function transformCourtBookingToCalendarEvent(
  booking: GroupCourtBooking
): CourtBookingCalendarEvent {
  const datePart = booking.date ? booking.date.split("T")[0] : ""
  const snapshots = booking.bookingItemsSnapshot || []
  const { startTime, endTime } = computeTimeRange(snapshots)

  if (!datePart || !startTime) {
    return {
      type: "court-booking",
      id: booking.id,
      title: booking.title,
      startAt: "",
      endAt: "",
      groupId: booking.groupId,
      metadata: {
        centerName: booking.centerName,
        centerAddress: "",
        totalBookingCost: booking.totalBookingCost,
        courtNames: computeCourtNames(snapshots),
        bookingItemsSnapshot: booking.bookingItemsSnapshot,
        linkedById: booking.creatorId || "",
        bookingId: booking.bookingId,
        note: booking.note,
        creator: booking.creator,
      },
    }
  }

  const startAt = `${datePart}T${startTime}:00`
  const endAt = endTime ? `${datePart}T${endTime}:00` : ""

  return {
    type: "court-booking",
    id: booking.id,
    title: booking.title,
    startAt,
    endAt,
    groupId: booking.groupId,
    metadata: {
      centerName: booking.centerName,
      centerAddress: "",
      totalBookingCost: booking.totalBookingCost,
      courtNames: computeCourtNames(snapshots),
      bookingItemsSnapshot: booking.bookingItemsSnapshot,
      linkedById: booking.creatorId || "",
      bookingId: booking.bookingId,
      note: booking.note,
      creator: booking.creator,
    },
  }
}

export function groupCalendarEventsByDate(events: CalendarEvent[]) {
  return events.reduce<Record<string, CalendarEvent[]>>(
    (accumulator, event) => {
      if (!event.startAt) return accumulator
      const date = new Date(event.startAt)
      if (isNaN(date.getTime())) return accumulator
      const key = date.toISOString().split("T")[0]
      if (!accumulator[key]) accumulator[key] = []
      accumulator[key].push(event)
      return accumulator
    },
    {}
  )
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getStartOfWeek(date: Date) {
  const start = new Date(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

function getEndOfWeek(date: Date) {
  const end = new Date(getStartOfWeek(date))
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function getStartOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getEndOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function formatDateTime(value: string) {
  if (!value) return ""
  const date = new Date(value)
  if (isNaN(date.getTime())) return ""
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTime(value: string) {
  if (!value) return ""
  const date = new Date(value)
  if (isNaN(date.getTime())) return ""
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDate(value: string) {
  if (!value) return ""
  const date = new Date(value)
  if (isNaN(date.getTime())) return ""
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatWeekdayAndDate(value: Date) {
  return value.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  })
}

export function getActivityTypeLabel(type: ActivityType) {
  switch (type) {
    case "PRACTICE":
      return "Tập luyện"
    case "MEETUP":
      return "Giao lưu (Meetup)"
    case "INTERNAL_MATCH":
      return "Thi đấu nội bộ"
    case "MEETING":
      return "Họp mặt"
    case "OTHER":
      return "Khác"
    default:
      return type
  }
}

export function getStatusLabel(status: GroupActivityStatus) {
  switch (status) {
    case "SCHEDULED":
      return "Sắp diễn ra"
    case "COMPLETED":
      return "Đã kết thúc"
    case "CANCELLED":
      return "Đã hủy"
    default:
      return status
  }
}

export function getActivityTypeBadgeClass(type: ActivityType) {
  switch (type) {
    case "PRACTICE":
      return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "MEETUP":
      return "bg-sky-100 text-sky-700 border-sky-200"
    case "INTERNAL_MATCH":
      return "bg-amber-100 text-amber-700 border-amber-200"
    case "MEETING":
      return "bg-violet-100 text-violet-700 border-violet-200"
    case "OTHER":
      return "bg-slate-100 text-slate-700 border-slate-200"
    default:
      return ""
  }
}

export function getStatusBadgeClass(status: GroupActivityStatus) {
  switch (status) {
    case "SCHEDULED":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "CANCELLED":
      return "bg-rose-100 text-rose-700 border-rose-200"
    default:
      return ""
  }
}

export function formatISO(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toISOString().split(".")[0] + "Z"
}

export function buildEventDateRange(
  date: string,
  startTime: string,
  endTime: string
) {
  const [year, month, day] = date.split("-").map(Number)
  const [startHour, startMinute] = startTime.split(":").map(Number)
  const [endHour, endMinute] = endTime.split(":").map(Number)

  const start = new Date(
    year,
    (month || 1) - 1,
    day || 1,
    startHour || 0,
    startMinute || 0
  )
  const end = new Date(
    year,
    (month || 1) - 1,
    day || 1,
    endHour || 0,
    endMinute || 0
  )

  return {
    startAt: formatISO(start),
    endAt: formatISO(end),
  }
}

export function toFormValues(event: GroupActivity): EventFormValues {
  const start = new Date(event.startAt)
  const end = new Date(event.endAt)

  return {
    title: event.title,
    activityType: event.activityType,
    date: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
    startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
    endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
    location: event.location,
    description: event.description,
    status: event.status,
    remindAt: event.remindAt,
  }
}

export function filterEvents(
  events: GroupActivity[],
  keyword: string,
  period: PeriodFilter,
  groupId?: string,
  activityType: ActivityTypeFilter = "all"
) {
  const now = new Date()
  const lowerKeyword = keyword.trim().toLowerCase()

  return events.filter((event) => {
    if (groupId && event.groupId !== groupId) {
      return false
    }

    const startAt = new Date(event.startAt)

    const matchesSearch =
      !lowerKeyword ||
      event.title.toLowerCase().includes(lowerKeyword) ||
      event.description.toLowerCase().includes(lowerKeyword) ||
      event.location.toLowerCase().includes(lowerKeyword)

    if (!matchesSearch) {
      return false
    }

    if (activityType !== "all" && event.activityType !== activityType) {
      return false
    }

    if (period === "today") {
      return isSameDay(startAt, now)
    }

    if (period === "week") {
      const start = getStartOfWeek(now)
      const end = getEndOfWeek(now)
      return startAt >= start && startAt <= end
    }

    const start = getStartOfMonth(now)
    const end = getEndOfMonth(now)
    return startAt >= start && startAt <= end
  })
}

export function sortEventsByStart(events: GroupActivity[]) {
  return [...events].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  )
}

export function getWeekDates(baseDate: Date) {
  const start = getStartOfWeek(baseDate)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

export function getMonthGridDates(baseDate: Date) {
  const monthStart = getStartOfMonth(baseDate)
  const monthEnd = getEndOfMonth(baseDate)

  const start = new Date(monthStart)
  const dayOfWeek = start.getDay()
  const shift = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  start.setDate(start.getDate() + shift)

  const end = new Date(monthEnd)
  const endDay = end.getDay()
  const endShift = endDay === 0 ? 0 : 7 - endDay
  end.setDate(end.getDate() + endShift)

  const dates: Date[] = []
  for (let cursor = new Date(start); cursor <= end; ) {
    dates.push(new Date(cursor))
    cursor = new Date(cursor.getTime() + DAY_IN_MS)
  }

  return dates
}

export function isDateInDay(targetDate: Date, eventDate: string) {
  return isSameDay(targetDate, new Date(eventDate))
}
