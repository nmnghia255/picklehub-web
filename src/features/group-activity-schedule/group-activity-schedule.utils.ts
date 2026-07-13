import type {
  ActivityType,
  ActivityTypeFilter,
  EventFormValues,
  GroupActivity,
  GroupActivityStatus,
  PeriodFilter,
} from "./group-activity-schedule.types"

const DAY_IN_MS = 24 * 60 * 60 * 1000

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
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
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
      return "activityTypes.PRACTICE"
    case "MEETUP":
      return "activityTypes.MEETUP"
    case "INTERNAL_MATCH":
      return "activityTypes.INTERNAL_MATCH"
    case "MEETING":
      return "activityTypes.MEETING"
    case "OTHER":
      return "activityTypes.OTHER"
    default:
      return type
  }
}

export function getStatusLabel(status: GroupActivityStatus) {
  switch (status) {
    case "SCHEDULED":
      return "activityStatuses.UPCOMING"
    case "COMPLETED":
      return "activityStatuses.FINISHED"
    case "CANCELLED":
      return "activityStatuses.CANCELLED"
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
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700"
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-100 dark:border-emerald-700"
    case "CANCELLED":
      return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900 dark:text-rose-100 dark:border-rose-700"
    default:
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700"
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
