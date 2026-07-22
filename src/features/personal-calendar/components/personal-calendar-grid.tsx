import { format, isSameDay, isSameMonth } from "date-fns"
import type { TFunction } from "i18next"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import type { CalendarActivity } from "../api/calendar-client"
import { PersonalCalendarEventItem } from "./personal-calendar-event-item"

const weekdayKeys = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

interface PersonalCalendarGridProps {
  currentDate: Date
  gridDays: Date[]
  groupedEvents: Record<string, CalendarActivity[]>
  isLoading: boolean
  onEventClick: (event: CalendarActivity) => void
  onSelectDate: (date: Date) => void
  selectedDate: Date
  t: TFunction<"common">
}

export function PersonalCalendarGrid({
  currentDate,
  gridDays,
  groupedEvents,
  isLoading,
  onEventClick,
  onSelectDate,
  selectedDate,
  t,
}: PersonalCalendarGridProps) {
  return (
    <>
      <div className="mb-2 grid grid-cols-7 gap-2 border-b pb-3 text-center text-xs font-semibold text-muted-foreground">
        {weekdayKeys.map((weekday, index) => (
          <span
            key={weekday}
            className={index === 6 ? "text-red-500" : undefined}
          >
            {t(`calendar.weekdays.${weekday}`)}
          </span>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-2" aria-busy="true">
          <span className="sr-only">{t("calendar.loading")}</span>
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[140px] space-y-2 rounded-xl border border-border/60 p-2"
            >
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {gridDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd")
            const dayEvents = groupedEvents[dateKey] ?? []
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={dateKey}
                onClick={() => onSelectDate(day)}
                className={`flex min-h-[140px] cursor-pointer flex-col justify-between rounded-xl border p-3 text-left shadow-sm transition-all duration-200 select-none ${
                  isSelected
                    ? "border-primary bg-primary/[0.02] shadow-md ring-2 ring-primary/30"
                    : "border-border/60 bg-card hover:border-border hover:bg-accent/30 hover:shadow-md"
                } ${!isCurrentMonth ? "bg-muted/50 opacity-30 hover:opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isToday
                        ? "bg-primary font-black text-primary-foreground shadow-sm ring-4 ring-primary/10"
                        : "text-foreground"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="scale-90 px-1.5 py-0 text-[10px] opacity-80"
                    >
                      {dayEvents.length}
                    </Badge>
                  )}
                </div>

                <div className="mt-2 flex flex-1 flex-col justify-start space-y-1.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <PersonalCalendarEventItem
                      key={event.id}
                      event={event}
                      onClick={onEventClick}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="mt-1 pl-1 text-[10px] font-semibold text-muted-foreground">
                      {t("calendar.moreActivities", {
                        count: dayEvents.length - 3,
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
