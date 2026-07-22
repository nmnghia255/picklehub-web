import { useTranslation } from "react-i18next"

import type { LearnerScheduleItem } from "@/features/coach/types/coach"
import { getTranslationStringArray } from "@/i18n/get-translation-array"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/utils/expense-utils"

function formatTime(value: string, locale: string) {
  return new Date(value).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function CalendarEventCard({
  item,
  onClick,
  locale,
}: {
  item: LearnerScheduleItem
  onClick: (item: LearnerScheduleItem) => void
  locale: string
}) {
  const isPast = item.status === "past"
  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className={cn(
        "w-full rounded-md border-l-4 px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent",
        item.kind === "class"
          ? "border-l-blue-500 bg-blue-50 dark:bg-blue-950"
          : "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950",
        isPast && "opacity-55"
      )}
    >
      {item.coverImageUrl && (
        <img
          src={item.coverImageUrl}
          alt={item.title}
          className="mb-1 h-16 w-full rounded object-cover"
        />
      )}
      <p className="truncate font-medium">{item.title}</p>
      <p className="truncate text-muted-foreground">
        {formatTime(item.startsAt, locale)} - {formatTime(item.endsAt, locale)}
      </p>
      {item.priceVnd !== null && (
        <p className="truncate text-muted-foreground">
          {formatCurrency(item.priceVnd, "VND", locale)}
        </p>
      )}
      {item.coachProfile?.displayName && (
        <p className="truncate text-muted-foreground">
          {item.coachProfile.displayName}
        </p>
      )}
    </button>
  )
}

export function LearnerScheduleCalendarView({
  allDays,
  currentDate,
  scheduleMap,
  today,
  locale,
  onItemClick,
}: {
  allDays: Date[]
  currentDate: Date
  scheduleMap: Map<string, LearnerScheduleItem[]>
  today: Date
  locale: string
  onItemClick: (item: LearnerScheduleItem) => void
}) {
  const { t, i18n } = useTranslation("common")
  const weeks: Date[][] = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  const weekDayLabels = getTranslationStringArray(
    i18n,
    "common",
    "learner.schedule.weekDays"
  )

  return (
    <div className="rounded-xl border bg-background shadow-sm">
      <div className="grid grid-cols-7 border-b">
        {weekDayLabels.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="p-3 text-center text-xs font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day) => {
            const dateKey = day.toISOString().slice(0, 10)
            const dayItems = scheduleMap.get(dateKey) ?? []
            const isToday =
              day.getFullYear() === today.getFullYear() &&
              day.getMonth() === today.getMonth() &&
              day.getDate() === today.getDate()
            const isCurrentMonth = day.getMonth() === currentDate.getMonth()

            return (
              <div
                key={dateKey}
                className={cn(
                  "min-h-28 border-t border-r p-1.5 transition-colors last:border-r-0",
                  !isCurrentMonth && "bg-muted/30"
                )}
              >
                <div className="mb-1 flex justify-center">
                  <span
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-full text-sm",
                      isToday &&
                        "bg-primary font-semibold text-primary-foreground",
                      !isToday && !isCurrentMonth && "text-muted-foreground"
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayItems.slice(0, 3).map((item) => (
                    <CalendarEventCard
                      key={item.id}
                      item={item}
                      locale={locale}
                      onClick={onItemClick}
                    />
                  ))}
                  {dayItems.length > 3 && (
                    <p className="text-center text-[10px] text-muted-foreground">
                      {t("learner.schedule.calendar.more", {
                        count: dayItems.length - 3,
                      })}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
