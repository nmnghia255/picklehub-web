"use client"

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Info,
  MapPin,
  Sparkles,
  User,
  Users,
} from "lucide-react"
import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { CalendarNavigation } from "@/components/calendar-navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import { type CalendarActivity, useMyCalendar } from "../api/calendar-client"

const weekdayKeys = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

const statusLabelKeys: Record<CalendarActivity["status"], string> = {
  COMPLETED: "completed",
  LIVE: "live",
  UPCOMING: "upcoming",
  PENDING_CONFIRM: "pendingConfirm",
  CANCELLED: "cancelled",
}

const typeLabelKeys: Record<CalendarActivity["type"], string> = {
  SOCIAL_SESSION: "socialSession",
  BOOKING: "booking",
  TOURNAMENT: "tournament",
  MATCH_PRACTICE: "matchPractice",
  MATCH_TOURNAMENT: "matchTournament",
}

export function PersonalCalendarPage() {
  const { t, i18n } = useTranslation("common")
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US"

  // Get date helper structures
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const gridDays = useMemo(() => {
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [gridStart, gridEnd])

  const { data: allEvents = [], isLoading } = useMyCalendar(
    format(gridStart, "yyyy-MM-dd"),
    format(gridEnd, "yyyy-MM-dd")
  )

  // Dialog state
  const [selectedEvent, setSelectedEvent] = useState<CalendarActivity | null>(
    null
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Filter events that fall in the current selected month
  const currentMonthEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const eventDate = new Date(event.startTime)
      return isSameMonth(eventDate, currentDate)
    })
  }, [allEvents, currentDate])

  // Group events by date key (yyyy-MM-dd)
  const groupedEvents = useMemo(() => {
    return allEvents.reduce<Record<string, CalendarActivity[]>>(
      (acc, event) => {
        const dateKey = format(new Date(event.startTime), "yyyy-MM-dd")
        if (!acc[dateKey]) {
          acc[dateKey] = []
        }
        acc[dateKey].push(event)
        return acc
      },
      {}
    )
  }, [allEvents])

  // Events of the selected day
  const selectedDayEvents = useMemo(() => {
    const dateKey = format(selectedDate, "yyyy-MM-dd")
    return groupedEvents[dateKey] ?? []
  }, [selectedDate, groupedEvents])

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1))
  }

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

  // Open dialog detail view
  const handleOpenEventDetail = (event: CalendarActivity) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  const monthYearLabel = t("calendar.monthYear", {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  })

  // Status Badge Class Generator
  const getStatusBadge = (status: CalendarActivity["status"]) => {
    const labelKey = statusLabelKeys[status]

    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {t(`calendar.status.${labelKey}`)}
          </Badge>
        )
      case "LIVE":
        return (
          <Badge className="animate-pulse border border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            {t(`calendar.status.${labelKey}`)}
          </Badge>
        )
      case "UPCOMING":
        return (
          <Badge className="border border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
            {t(`calendar.status.${labelKey}`)}
          </Badge>
        )
      case "PENDING_CONFIRM":
        return (
          <Badge className="border border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            {t(`calendar.status.${labelKey}`)}
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge className="border border-red-200 bg-red-100 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {t(`calendar.status.${labelKey}`)}
          </Badge>
        )
    }
  }

  // Event Type Icon/Badge Generator
  const getEventTypeBadge = (type: CalendarActivity["type"]) => {
    const labelKey = typeLabelKeys[type]

    switch (type) {
      case "SOCIAL_SESSION":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-orange-200 bg-orange-50 font-normal text-orange-700 dark:border-orange-900/30 dark:bg-orange-950/20 dark:text-orange-400"
          >
            <span>🏓</span> {t(`calendar.types.${labelKey}`)}
          </Badge>
        )
      case "BOOKING":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-blue-200 bg-blue-50 font-normal text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400"
          >
            <span>📅</span> {t(`calendar.types.${labelKey}`)}
          </Badge>
        )
      case "TOURNAMENT":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-purple-200 bg-purple-50 font-normal text-purple-700 dark:border-purple-900/30 dark:bg-purple-950/20 dark:text-purple-400"
          >
            <span>🏆</span> {t(`calendar.types.${labelKey}`)}
          </Badge>
        )
      case "MATCH_PRACTICE":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-pink-200 bg-pink-50 font-normal text-pink-700 dark:border-pink-900/30 dark:bg-pink-950/20 dark:text-pink-400"
          >
            <span>⚔️</span> {t(`calendar.types.${labelKey}`)}
          </Badge>
        )
      case "MATCH_TOURNAMENT":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-200 bg-amber-50 font-normal text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400"
          >
            <span>🏅</span> {t(`calendar.types.${labelKey}`)}
          </Badge>
        )
    }
  }

  // Format ISO time to HH:MM
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      const hrs = String(d.getHours()).padStart(2, "0")
      const mins = String(d.getMinutes()).padStart(2, "0")
      return `${hrs}:${mins}`
    } catch {
      return ""
    }
  }

  // Format ISO date to readable string
  const formatDateString = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString(locale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return ""
    }
  }

  // Event item inside cell component
  const EventCellItem = ({ event }: { event: CalendarActivity }) => {
    const getDotColor = (status: CalendarActivity["status"]) => {
      if (status === "COMPLETED") return "bg-slate-400"
      if (status === "LIVE") return "bg-blue-500"
      return "bg-emerald-500"
    }

    const typeEmoji =
      event.type === "SOCIAL_SESSION"
        ? "🏓"
        : event.type === "BOOKING"
          ? "📅"
          : "🏆"

    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleOpenEventDetail(event)
        }}
        className="group/item flex w-full items-center gap-2 truncate rounded-md border border-border/30 bg-muted/40 px-2 py-1.5 text-left text-[12px] font-semibold transition-all hover:border-primary/30 hover:bg-accent/60"
        title={`${event.title} (${event.location.name})`}
      >
        <span
          className={`size-2 shrink-0 rounded-full ${getDotColor(event.status)} shadow-xs`}
        />
        <span className="shrink-0 grayscale-[0.5] transition-all group-hover/item:grayscale-0">
          {typeEmoji}
        </span>
        <span className="truncate text-foreground/80 transition-colors group-hover/item:text-primary">
          {event.title}
        </span>
      </button>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Top Banner section */}
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
        {/* Controls toolbar */}
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

        {/* Main Layout Grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Calendar Card */}
          <Card className="overflow-hidden border-border bg-card shadow-md">
            <CardHeader className="border-b bg-muted/15 pb-4">
              <div className="flex items-center gap-2 font-bold text-primary">
                <CalendarDays className="size-5" />
                <span>{t("calendar.monthViewLabel")}</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Calendar grid weekday header */}
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

              {/* Grid cells */}
              {isLoading ? (
                /* Loading skeleton grid */
                <div className="grid grid-cols-7 gap-2">
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
                        onClick={() => setSelectedDate(day)}
                        className={`flex min-h-[140px] cursor-pointer flex-col justify-between rounded-xl border p-3 text-left shadow-sm transition-all duration-200 select-none ${
                          isSelected
                            ? "border-primary bg-primary/[0.02] shadow-md ring-2 ring-primary/30"
                            : "border-border/60 bg-card hover:border-border hover:bg-accent/30 hover:shadow-md"
                        } ${!isCurrentMonth ? "bg-muted/50 opacity-30 hover:opacity-60" : ""}`}
                      >
                        {/* Day header: number and today indicator */}
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

                        {/* Event list container */}
                        <div className="mt-2 flex flex-1 flex-col justify-start space-y-1.5">
                          {dayEvents.slice(0, 3).map((event) => (
                            <EventCellItem key={event.id} event={event} />
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
            </CardContent>
          </Card>

          {/* Sidebar daily agenda panel */}
          <Card className="flex flex-col border-border bg-card shadow-md">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-1.5 text-base font-bold">
                <Sparkles className="size-4 text-primary" />
                {t("calendar.dayDetailsTitle", {
                  date: format(selectedDate, "dd/MM/yyyy"),
                })}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("calendar.dayDetailsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-4">
              {selectedDayEvents.length === 0 ? (
                /* Empty state for the selected day */
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-4 py-10 text-center">
                  <span className="mb-2 text-3xl">🍃</span>
                  <p className="text-sm font-semibold text-foreground/80">
                    {t("calendar.noDayActivitiesTitle")}
                  </p>
                  <p className="mt-1 max-w-[200px] text-xs text-muted-foreground">
                    {t("calendar.noDayActivitiesDescription")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {t("calendar.activitiesCount", {
                      count: selectedDayEvents.length,
                    })}
                  </p>
                  <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
                    {selectedDayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleOpenEventDetail(event)}
                        className="group relative flex cursor-pointer flex-col gap-2 rounded-lg border border-border/80 bg-background/50 p-3 transition-all duration-200 hover:border-primary/40 hover:bg-accent/40 hover:shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                            {event.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="size-3.5" />
                          <span>
                            {formatTime(event.startTime)} -{" "}
                            {formatTime(event.endTime)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate">
                            {event.location.name}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center justify-between border-t border-border/40 pt-2">
                          {getEventTypeBadge(event.type)}
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {t("calendar.participantsCount", {
                              count: event.participantsCount,
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Month Empty State */}
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
                monthYear: monthYearLabel.toLowerCase(),
              })}
            </p>
          </div>
        )}
      </div>

      {/* Event detail modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] animate-in overflow-hidden rounded-xl border border-border bg-card p-0 shadow-2xl duration-200 fade-in sm:max-w-[500px]">
          <div className="relative h-2.5 w-full bg-primary" />

          {selectedEvent && (
            <div className="space-y-5 p-6">
              <DialogHeader className="space-y-2">
                <div className="flex items-center gap-2.5">
                  {getEventTypeBadge(selectedEvent.type)}
                  {getStatusBadge(selectedEvent.status)}
                </div>
                <DialogTitle className="text-xl leading-snug font-extrabold tracking-tight text-foreground">
                  {selectedEvent.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Info className="size-3.5 text-primary" />
                  {t("calendar.detailDescription")}
                </DialogDescription>
              </DialogHeader>

              <Separator className="bg-border/60" />

              {/* Details table / grid */}
              <div className="space-y-4 text-sm">
                {/* Time */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground">
                    <Clock className="size-4 text-primary/80" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {t("calendar.time")}
                    </p>
                    <p className="font-bold text-foreground/90">
                      {formatTime(selectedEvent.startTime)} -{" "}
                      {formatTime(selectedEvent.endTime)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateString(selectedEvent.startTime)}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground">
                    <MapPin className="size-4 text-primary/80" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {t("calendar.location")}
                    </p>
                    <p className="leading-relaxed font-medium text-foreground/95">
                      {selectedEvent.location.name}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {selectedEvent.location.address}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Organizer */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground">
                    <User className="size-4 text-primary/80" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {t("calendar.organizer")}
                    </p>
                    <p className="font-semibold text-foreground/90">
                      {selectedEvent.organizer}
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground">
                    <Users className="size-4 text-primary/80" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {t("calendar.participants")}
                    </p>
                    <p className="font-semibold text-foreground/90">
                      {t("calendar.participantsJoined", {
                        count: selectedEvent.participantsCount,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/60" />

              {/* Description */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  {t("calendar.descriptionLabel")}
                </h5>
                <p className="rounded-lg border border-border/30 bg-muted/40 p-3 text-sm leading-relaxed text-foreground/80">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Modal footer close button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  {t("calendar.close")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
