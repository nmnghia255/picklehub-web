"use client"

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { CalendarCheck, CalendarDays } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { CalendarNavigation } from "@/components/calendar-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { type CalendarActivity, useMyCalendar } from "../api/calendar-client"
import {
  formatCalendarDate,
  formatCalendarTime,
} from "../utils/personal-calendar-formatters"
import { PersonalCalendarDayAgenda } from "./personal-calendar-day-agenda"
import { PersonalCalendarEventDialog } from "./personal-calendar-event-dialog"
import { PersonalCalendarGrid } from "./personal-calendar-grid"

export function PersonalCalendarPage() {
  const { t, i18n } = useTranslation("common")
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US"

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const gridDays = useMemo(
    () => eachDayOfInterval({ start: gridStart, end: gridEnd }),
    [gridStart, gridEnd]
  )

  const {
    data: allEvents = [],
    isLoading,
    isError,
    refetch,
  } = useMyCalendar(
    format(gridStart, "yyyy-MM-dd"),
    format(gridEnd, "yyyy-MM-dd")
  )

  const [selectedEvent, setSelectedEvent] = useState<CalendarActivity | null>(
    null
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const currentMonthEvents = useMemo(
    () =>
      allEvents.filter((event) =>
        isSameMonth(new Date(event.startTime), currentDate)
      ),
    [allEvents, currentDate]
  )

  const groupedEvents = useMemo(
    () =>
      allEvents.reduce<Record<string, CalendarActivity[]>>((acc, event) => {
        const dateKey = format(new Date(event.startTime), "yyyy-MM-dd")
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(event)
        return acc
      }, {}),
    [allEvents]
  )

  const selectedDayEvents = useMemo(() => {
    const dateKey = format(selectedDate, "yyyy-MM-dd")
    return groupedEvents[dateKey] ?? []
  }, [selectedDate, groupedEvents])

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1))

  const handleGoToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  const handleMonthChange = (monthIdx: number) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), monthIdx, 1))
  }

  const handleYearChange = (year: number) => {
    setCurrentDate((prev) => new Date(year, prev.getMonth(), 1))
  }

  const handleOpenEventDetail = (event: CalendarActivity) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  const monthYearLabel = t("calendar.monthYear", {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  })

  useEffect(() => {
    document.title = t("calendar.pageTitle")
    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    )
    if (description) description.content = t("calendar.pageDescription")
  }, [t])

  if (isError) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2">
                <CalendarCheck className="size-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  {t("calendar.title")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("calendar.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="mb-2 text-lg font-medium">
              {t("calendar.errorTitle")}
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              {t("calendar.errorDescription")}
            </p>
            <Button variant="outline" onClick={() => void refetch()}>
              {t("calendar.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <CalendarCheck className="size-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {t("calendar.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("calendar.description")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-border bg-card/65 shadow-sm backdrop-blur-sm">
          <CardContent className="p-4">
            <CalendarNavigation
              currentDate={currentDate}
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={handleGoToday}
            />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="overflow-hidden border-border bg-card shadow-md">
            <CardHeader className="border-b bg-muted/15 pb-4">
              <div className="flex items-center gap-2 font-bold text-primary">
                <CalendarDays className="size-5" />
                <span>{t("calendar.viewModes.month")}</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <PersonalCalendarGrid
                currentDate={currentDate}
                gridDays={gridDays}
                groupedEvents={groupedEvents}
                isLoading={isLoading}
                onEventClick={handleOpenEventDetail}
                onSelectDate={setSelectedDate}
                selectedDate={selectedDate}
                t={t}
              />
            </CardContent>
          </Card>

          <PersonalCalendarDayAgenda
            events={selectedDayEvents}
            onEventClick={handleOpenEventDetail}
            selectedDate={selectedDate}
            t={t}
          />
        </div>

        {currentMonthEvents.length === 0 && !isLoading && (
          <div className="mt-6 flex animate-in flex-col items-center justify-center rounded-2xl border border-dashed bg-card/40 p-12 text-center duration-300 fade-in">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
              <CalendarDays className="size-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {t("calendar.monthEmptyTitle")}
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {t("calendar.monthEmptyDescription", {
                monthYear: monthYearLabel,
              })}
            </p>
          </div>
        )}
      </div>

      <PersonalCalendarEventDialog
        formatDateString={(value) => formatCalendarDate(value, locale)}
        formatTime={formatCalendarTime}
        onOpenChange={setIsDialogOpen}
        open={isDialogOpen}
        selectedEvent={selectedEvent}
        t={t}
      />
    </div>
  )
}
