import type {
  DayOfWeek,
  RecurringSocialFormData,
  SchedulePreview,
} from "./recurring-socials.types"

type Translator = (key: string, options?: Record<string, unknown>) => string

export function generateSchedulePreview(
  formData: RecurringSocialFormData,
  locale = "vi-VN"
): SchedulePreview[] {
  const schedules: SchedulePreview[] = []
  const startDate = new Date(formData.startDate)
  const endDate = new Date(formData.endDate)
  const weekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
  })

  if (formData.recurrenceType === "weekly" && formData.daysOfWeek) {
    const dayIndexMap: { [key in DayOfWeek]: number } = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    }

    const dayIndices = formData.daysOfWeek
      .map((d) => dayIndexMap[d])
      .sort((a, b) => a - b)

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dayIndex = currentDate.getDay()
      if (dayIndices.includes(dayIndex)) {
        schedules.push({
          date: formatDateISO(currentDate),
          dayName: weekdayFormatter.format(currentDate),
          startTime: formData.startTime,
          endTime: formData.endTime,
          courts: formData.selectedCourts.length,
          totalCapacity: formData.selectedCourts.length * formData.maxPerCourt,
        })
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
  } else if (formData.recurrenceType === "monthly" && formData.dayOfMonth) {
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      if (currentDate.getDate() === formData.dayOfMonth) {
        schedules.push({
          date: formatDateISO(currentDate),
          dayName: weekdayFormatter.format(currentDate),
          startTime: formData.startTime,
          endTime: formData.endTime,
          courts: formData.selectedCourts.length,
          totalCapacity: formData.selectedCourts.length * formData.maxPerCourt,
        })
      }
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
  } else if (formData.recurrenceType === "quarterly" && formData.quarterDay) {
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const month = currentDate.getMonth() + 1
      if (
        (month === 1 || month === 4 || month === 7 || month === 10) &&
        currentDate.getDate() === formData.quarterDay
      ) {
        schedules.push({
          date: formatDateISO(currentDate),
          dayName: weekdayFormatter.format(currentDate),
          startTime: formData.startTime,
          endTime: formData.endTime,
          courts: formData.selectedCourts.length,
          totalCapacity: formData.selectedCourts.length * formData.maxPerCourt,
        })
      }
      currentDate.setMonth(currentDate.getMonth() + 3)
    }
  }

  return schedules.slice(0, 10)
}

export function formatDateISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatDateDisplay(dateStr: string): string {
  return formatDateDisplayWithLocale(dateStr, "vi-VN")
}

export function formatDateDisplayWithLocale(
  dateStr: string,
  locale: string
): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatDateRangeDisplay(
  startDate: string,
  endDate: string,
  locale = "vi-VN"
): string {
  return `${formatDateDisplayWithLocale(startDate, locale)} - ${formatDateDisplayWithLocale(endDate, locale)}`
}

export function getRecurrenceTypeLabel(type: string, t?: Translator): string {
  if (t) {
    const key =
      type === "weekly"
        ? "recurringSocials.form.recurrenceTypes.weekly"
        : type === "monthly"
          ? "recurringSocials.form.recurrenceTypes.monthly"
          : type === "quarterly"
            ? "recurringSocials.form.recurrenceTypes.quarterly"
            : ""
    return key ? t(key) : type
  }

  const labels: { [key: string]: string } = {
    weekly: "Weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
  }
  return labels[type] || type
}

export function getStatusBadgeColor(status: string): string {
  const colors: { [key: string]: string } = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    paused:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    expired: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  }
  return colors[status] || colors.expired
}

export function getStatusLabel(status: string, t?: Translator): string {
  if (t) {
    const key =
      status === "active"
        ? "recurringSocials.list.statuses.active"
        : status === "paused"
          ? "recurringSocials.list.statuses.paused"
          : status === "expired"
            ? "recurringSocials.list.statuses.expired"
            : ""
    return key ? t(key) : status
  }

  const labels: { [key: string]: string } = {
    active: "Active",
    paused: "Paused",
    expired: "Expired",
  }
  return labels[status] || status
}

export function getLocalizedText(
  value: string,
  t?: Translator,
  key?: string
): string {
  return t && key ? t(key) : value
}

export function calculateTotalSchedules(schedules: SchedulePreview[]): number {
  return schedules.length
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getRecurrenceDescription(
  type: string,
  daysOfWeek?: string[],
  dayOfMonth?: number,
  monthPosition?: string,
  t?: Translator
): string {
  if (type === "weekly" && daysOfWeek) {
    const dayLabels = daysOfWeek.map((d) => getDayLabel(d, t)).join(", ")
    return t
      ? t("recurringSocials.utils.weeklyDescription", { days: dayLabels })
      : `Every ${dayLabels}`
  }
  if (type === "monthly" && dayOfMonth) {
    return t
      ? t("recurringSocials.utils.monthlyDescription", { dayOfMonth })
      : `Day ${dayOfMonth} each month`
  }
  if (type === "quarterly") {
    return t
      ? t("recurringSocials.form.recurrenceTypes.quarterly")
      : "Quarterly"
  }
  return ""
}

function getDayLabel(day: string, t?: Translator): string {
  if (t) {
    return t(`recurringSocials.form.weekdays.${day}`)
  }

  const labels: { [key: string]: string } = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  }
  return labels[day] || day
}

export function getSocialTypeLabel(type: string, t?: Translator): string {
  if (t) {
    const key =
      type === "beginner"
        ? "recurringSocials.form.socialTypes.beginner"
        : type === "intermediate"
          ? "recurringSocials.form.socialTypes.intermediate"
          : type === "advanced"
            ? "recurringSocials.form.socialTypes.advanced"
            : type === "competitive"
              ? "recurringSocials.form.socialTypes.competitive"
              : type === "league"
                ? "recurringSocials.form.socialTypes.league"
                : type === "social"
                  ? "recurringSocials.form.socialTypes.social"
                  : ""
    return key ? t(key) : type
  }

  const labels: { [key: string]: string } = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    competitive: "Competitive",
    league: "League",
    social: "Social",
  }
  return labels[type] || type
}
