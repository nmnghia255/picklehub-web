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
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { CalendarNavigation } from "@/components/calendar-navigation"
import { ErrorState } from "@/components/shared/error-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/features/auth/hooks/use-session"
import { getTranslationStringArray } from "@/i18n/get-translation-array"
import { getErrorMessage } from "@/lib/api-client"

import { useCoachSchedule } from "../hooks/use-coach-queries"
import type { CoachScheduleItem } from "../types/coach"

type ViewMode = "calendar" | "agenda" | "list"

const DEFAULT_LIMIT = 10

function getLocaleCode(language: string) {
  return language.startsWith("vi") ? "vi-VN" : "en-US"
}

const statusVariantMap: Record<
  CoachScheduleItem["status"],
  "default" | "secondary" | "outline"
> = {
  upcoming: "secondary",
  live: "default",
  past: "outline",
  pending: "secondary",
}

const statusLabel = (
  status: CoachScheduleItem["status"],
  t: (key: string) => string
) => {
  const m: Record<string, string> = {
    upcoming: t("coach.schedule.statusUpcoming"),
    live: t("coach.schedule.statusLive"),
    past: t("coach.schedule.statusPast"),
    pending: t("coach.schedule.statusPending"),
  }
  return m[status] ?? status
}

function monthRange(date: Date) {
  return {
    from: startOfMonth(date).toISOString(),
    to: endOfMonth(date).toISOString(),
  }
}

function formatTime(value: string, locale: string) {
  return new Date(value).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function buildSearchText(item: CoachScheduleItem) {
  return [
    item.title,
    item.description ?? "",
    item.location ?? "",
    item.coachName ?? "",
    item.learnerName ?? "",
    item.learners.map((learner) => learner.name).join(" "),
  ]
    .join(" ")
    .toLowerCase()
}

function itemTypeLabel(
  type: CoachScheduleItem["type"],
  t: (key: string) => string
) {
  return type === "class"
    ? t("coach.schedule.typeClass")
    : t("coach.schedule.typeBooking")
}

export function CoachWeekSchedule() {
  const { t, i18n } = useTranslation("common")
  const locale = getLocaleCode(i18n.language)
  const session = useSession()
  const weekDays = getTranslationStringArray(
    i18n,
    "common",
    "coach.schedule.weekDays"
  )
  const [viewMode, setViewMode] = useState<ViewMode>("calendar")
  const [currentDate, setCurrentDate] = useState(() => startOfMonth(new Date()))
  const [kind, setKind] = useState("all")
  const [state, setState] = useState("all")
  const [sortOrder, setSortOrder] = useState("desc")
  const [searchTerm, setSearchTerm] = useState("")
  const [fromDate, setFromDate] = useState<string | undefined>(undefined)
  const [toDate, setToDate] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [detailItem, setDetailItem] = useState<CoachScheduleItem | null>(null)

  const handleViewModeChange = (value: ViewMode) => {
    setViewMode(value)
    if (value === "list") {
      setCurrentDate(startOfMonth(new Date()))
    }
    setSearchTerm("")
    setKind("all")
    setState("all")
    setFromDate(undefined)
    setToDate(undefined)
    setPage(1)
  }

  const calendarQueryRange = useMemo(
    () => monthRange(currentDate),
    [currentDate]
  )

  const scheduleParams = useMemo(() => {
    if (viewMode === "calendar" || viewMode === "agenda") {
      return {
        from: calendarQueryRange.from,
        to: calendarQueryRange.to,
        sort: "asc",
      }
    }

    const params: Record<string, unknown> = {
      page,
      limit: DEFAULT_LIMIT,
      sort: "desc",
    }

    if (kind !== "all") params.kind = kind
    if (state !== "all") params.state = state
    if (fromDate) params.from = `${fromDate}T00:00:00.000Z`
    if (toDate) params.to = `${toDate}T23:59:59.999Z`

    return params
  }, [calendarQueryRange, fromDate, kind, page, state, toDate, viewMode])

  const { data, isLoading, isError, error, refetch } = useCoachSchedule(
    scheduleParams,
    { enabled: !!session?.user }
  )

  const items = data?.data ?? []
  const totalPages = data?.pagination?.totalPages ?? 1

  const gridDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [currentDate])

  const monthScheduleMap = useMemo(() => {
    const map = new Map<string, CoachScheduleItem[]>()

    for (const item of items) {
      const date = new Date(item.startTime)
      if (Number.isNaN(date.getTime())) continue

      const key = format(date, "yyyy-MM-dd")
      const existing = map.get(key) ?? []
      existing.push(item)
      map.set(key, existing)
    }

    return map
  }, [items])

  const filteredListItems = useMemo(() => {
    const loweredSearch = searchTerm.trim().toLowerCase()

    const filtered = items.filter((item) => {
      if (kind !== "all" && item.type !== kind) return false
      if (state !== "all" && item.status !== state) return false
      if (!loweredSearch) return true
      return buildSearchText(item).includes(loweredSearch)
    })

    filtered.sort((left, right) => {
      const leftTime = new Date(left.startTime).getTime()
      const rightTime = new Date(right.startTime).getTime()
      return sortOrder === "desc" ? rightTime - leftTime : leftTime - rightTime
    })

    return filtered
  }, [items, kind, searchTerm, sortOrder, state])

  const paginatedListItems = useMemo(() => {
    const startIndex = (page - 1) * DEFAULT_LIMIT
    return filteredListItems.slice(startIndex, startIndex + DEFAULT_LIMIT)
  }, [filteredListItems, page])

  const groupedByDate = useMemo(() => {
    const map = new Map<string, CoachScheduleItem[]>()
    const sorted = [...items].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    for (const item of sorted) {
      const key = format(new Date(item.startTime), "yyyy-MM-dd")
      const existing = map.get(key) ?? []
      existing.push(item)
      map.set(key, existing)
    }
    return map
  }, [items])

  const sortedDates = useMemo(
    () => Array.from(groupedByDate.keys()).sort(),
    [groupedByDate]
  )

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleKindChange = (value: string) => {
    setKind(value)
    setPage(1)
  }

  const handleStateChange = (value: string) => {
    setState(value)
    setPage(1)
  }

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value)
    setPage(1)
  }

  const handleFromDateChange = (value: string | undefined) => {
    setFromDate(value)
    setPage(1)
  }

  const handleToDateChange = (value: string | undefined) => {
    setToDate(value)
    setPage(1)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  if (isError) {
    return (
      <ErrorState
        title={t("coach.schedule.errorTitle")}
        description={getErrorMessage(error)}
        retry={refetch}
      />
    )
  }

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1))
  const handleMonthChange = (month: number) =>
    setCurrentDate((prev) => new Date(prev.getFullYear(), month, 1))
  const handleYearChange = (year: number) =>
    setCurrentDate((prev) => new Date(year, prev.getMonth(), 1))
  const handleToday = () => setCurrentDate(startOfMonth(new Date()))

  const renderStatusBadges = (item: CoachScheduleItem) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        variant={statusVariantMap[item.status]}
        className="rounded-full text-[10px]"
      >
        {statusLabel(item.status, t)}
      </Badge>
      <Badge
        variant="outline"
        className="rounded-full border-border bg-background text-[10px] text-foreground"
      >
        {itemTypeLabel(item.type, t)}
      </Badge>
      {item.sourceStatus && (
        <Badge
          variant="outline"
          className="rounded-full border-border bg-background text-[10px] text-foreground"
        >
          {(
            {
              PENDING_CONFIRMATION: t(
                "coach.schedule.sourceStatusPendingConfirmation"
              ),
              CONFIRMED: t("coach.schedule.sourceStatusConfirmed"),
              COMPLETED: t("coach.schedule.sourceStatusCompleted"),
              REJECTED: t("coach.schedule.sourceStatusRejected"),
              CANCELLED: t("coach.schedule.sourceStatusCancelled"),
            } as Record<string, string>
          )[item.sourceStatus] ?? item.sourceStatus}
        </Badge>
      )}
      {item.paymentStatus && (
        <Badge
          variant="outline"
          className="rounded-full border-border bg-background text-[10px] text-foreground"
        >
          {(
            {
              PENDING_PROOF: t("coach.schedule.paymentPendingProof"),
              PENDING_REVIEW: t("coach.schedule.paymentPendingReview"),
              SETTLED: t("coach.schedule.paymentSettled"),
              REJECTED: t("coach.schedule.paymentRejected"),
            } as Record<string, string>
          )[item.paymentStatus] ?? item.paymentStatus}
        </Badge>
      )}
    </div>
  )

  function renderCalendarView() {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <CalendarNavigation
            currentDate={currentDate}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
          />

          <Select value={viewMode} onValueChange={handleViewModeChange}>
            <SelectTrigger className="min-w-35 border-border bg-background text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">
                {t("coach.schedule.viewCalendar")}
              </SelectItem>
              <SelectItem value="agenda">
                {t("coach.schedule.viewAgenda")}
              </SelectItem>
              <SelectItem value="list">
                {t("coach.schedule.viewList")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="rounded-2xl border border-border bg-background shadow-sm">
          <CardContent className="overflow-x-auto p-4">
            <div className="min-w-245 space-y-3">
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="rounded-xl bg-muted px-3 py-2 text-center text-sm font-medium text-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {gridDays.map((day) => {
                  const key = format(day, "yyyy-MM-dd")
                  const dayEvents = monthScheduleMap.get(key) ?? []
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isToday = isSameDay(day, new Date())

                  return (
                    <div
                      key={key}
                      className={`min-h-36 rounded-2xl border border-border p-2 text-left transition ${
                        isCurrentMonth
                          ? "bg-background"
                          : "bg-muted/40 text-muted-foreground"
                      } ${isToday ? "ring-2 ring-ring/20" : ""}`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span
                          className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}
                        >
                          {day.getDate()}
                        </span>
                        {dayEvents.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="rounded-full px-2 py-0 text-[10px]"
                          >
                            {dayEvents.length}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {dayEvents.slice(0, 3).map((event) => (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => setDetailItem(event)}
                            className="flex w-full flex-col gap-1 rounded-lg border border-border/60 bg-muted/50 px-2 py-1.5 text-left text-[12px] transition hover:border-border hover:bg-accent/60"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate font-semibold text-foreground">
                                {event.title}
                              </span>
                              <span className="shrink-0 text-[10px] text-muted-foreground">
                                {formatTime(event.startTime, locale)}
                              </span>
                            </div>
                            <div className="truncate text-[11px] text-muted-foreground">
                              {event.location ?? t("coach.schedule.noLocation")}
                            </div>
                          </button>
                        ))}

                        {dayEvents.length > 3 && (
                          <p className="pl-1 text-xs text-muted-foreground">
                            {t("coach.schedule.moreEvents", {
                              count: dayEvents.length - 3,
                            })}
                          </p>
                        )}

                        {dayEvents.length === 0 && (
                          <p className="px-1 py-3 text-center text-xs text-muted-foreground">
                            {t("coach.schedule.emptyDay")}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  function renderListView() {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
            <Input
              value={searchTerm}
              onChange={(event) => handleSearchTermChange(event.target.value)}
              placeholder={t("coach.schedule.searchPlaceholder")}
              className="w-full max-w-sm bg-background text-foreground"
            />

            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-sm text-muted-foreground">
                {t("coach.schedule.filterKind")}
              </Label>
              <Select value={kind} onValueChange={handleKindChange}>
                <SelectTrigger className="min-w-40 border-border bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("coach.schedule.filterAll")}
                  </SelectItem>
                  <SelectItem value="class">
                    {t("coach.schedule.filterClass")}
                  </SelectItem>
                  <SelectItem value="booking">
                    {t("coach.schedule.filterBooking")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-sm text-muted-foreground">
                {t("coach.schedule.filterStatus")}
              </Label>
              <Select value={state} onValueChange={handleStateChange}>
                <SelectTrigger className="min-w-35 border-border bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("coach.schedule.filterAll")}
                  </SelectItem>
                  <SelectItem value="upcoming">
                    {t("coach.schedule.filterUpcoming")}
                  </SelectItem>
                  <SelectItem value="live">
                    {t("coach.schedule.filterLive")}
                  </SelectItem>
                  <SelectItem value="past">
                    {t("coach.schedule.filterPast")}
                  </SelectItem>
                  <SelectItem value="pending">
                    {t("coach.schedule.filterPending")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-sm text-muted-foreground">
                {t("coach.schedule.filterSort")}
              </Label>
              <Select value={sortOrder} onValueChange={handleSortOrderChange}>
                <SelectTrigger className="min-w-30 border-border bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">
                    {t("coach.schedule.sortOldest")}
                  </SelectItem>
                  <SelectItem value="desc">
                    {t("coach.schedule.sortNewest")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-sm text-muted-foreground">
                {t("coach.schedule.filterFromDate")}
              </Label>
              <Input
                type="date"
                value={fromDate ?? ""}
                onChange={(event) =>
                  handleFromDateChange(event.target.value || undefined)
                }
                className="w-42.5 bg-background text-foreground"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-sm text-muted-foreground">
                {t("coach.schedule.filterToDate")}
              </Label>
              <Input
                type="date"
                value={toDate ?? ""}
                onChange={(event) =>
                  handleToDateChange(event.target.value || undefined)
                }
                className="w-42.5 bg-background text-foreground"
              />
            </div>
          </div>

          <Select value={viewMode} onValueChange={handleViewModeChange}>
            <SelectTrigger className="min-w-35 border-border bg-background text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">
                {t("coach.schedule.viewCalendar")}
              </SelectItem>
              <SelectItem value="agenda">
                {t("coach.schedule.viewAgenda")}
              </SelectItem>
              <SelectItem value="list">
                {t("coach.schedule.viewList")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="rounded-2xl border border-border bg-background shadow-sm">
          <CardContent className="space-y-3 p-4">
            {paginatedListItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {t("coach.schedule.noEventsDate")}
              </div>
            ) : (
              paginatedListItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full text-left"
                  onClick={() => setDetailItem(item)}
                >
                  <Card className="rounded-2xl border border-border bg-background shadow-sm transition hover:bg-accent/50">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold text-foreground">
                              {item.title}
                            </p>
                            {renderStatusBadges(item)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(item.startTime, locale)} ·{" "}
                            {formatTime(item.startTime, locale)} -{" "}
                            {formatTime(item.endTime, locale)}
                          </p>
                          {item.description && (
                            <p className="text-sm wrap-break-word whitespace-pre-wrap text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 text-right text-sm text-muted-foreground">
                          <p>
                            {t("coach.schedule.learnerCount", {
                              count: item.learnerCount,
                            })}
                          </p>
                          {item.location && (
                            <p className="max-w-56 wrap-break-word whitespace-pre-wrap">
                              {item.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {t("coach.schedule.pageInfo", { page, total: totalPages })}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
            >
              {t("coach.schedule.prevPage")}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page === totalPages}
            >
              {t("coach.schedule.nextPage")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  function renderAgendaView() {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <CalendarNavigation
            currentDate={currentDate}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
          />

          <Select value={viewMode} onValueChange={handleViewModeChange}>
            <SelectTrigger className="min-w-35 border-border bg-background text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">
                {t("coach.schedule.viewCalendar")}
              </SelectItem>
              <SelectItem value="agenda">
                {t("coach.schedule.viewAgenda")}
              </SelectItem>
              <SelectItem value="list">
                {t("coach.schedule.viewList")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="rounded-2xl border border-border bg-background shadow-sm">
          <CardContent className="p-4">
            {sortedDates.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {t("coach.schedule.noEventsMonth")}
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((dateKey) => {
                  const dayItems = groupedByDate.get(dateKey) ?? []
                  const dateObj = new Date(dateKey + "T00:00:00")

                  return (
                    <div key={dateKey}>
                      <div className="mb-3 flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {dateObj.getDate()}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {dateObj.toLocaleDateString(locale, {
                            weekday: "long",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <Badge variant="secondary" className="rounded-full">
                          {t("coach.schedule.learnerCount", {
                            count: dayItems.length,
                          })}
                        </Badge>
                      </div>

                      <div className="ml-5 space-y-2 border-l-2 border-border pl-4">
                        {dayItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="w-full text-left"
                            onClick={() => setDetailItem(item)}
                          >
                            <Card className="rounded-xl border border-border bg-background shadow-sm transition hover:bg-accent/50">
                              <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-semibold text-foreground">
                                      {item.title}
                                    </p>
                                    {renderStatusBadges(item)}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {formatTime(item.startTime, locale)} -{" "}
                                    {formatTime(item.endTime, locale)}
                                  </p>
                                </div>
                                <div className="shrink-0 text-right text-sm text-muted-foreground">
                                  <p>
                                    {t("coach.schedule.learnerCount", {
                                      count: item.learnerCount,
                                    })}
                                  </p>
                                  {item.location && (
                                    <p className="max-w-56 truncate">
                                      {item.location}
                                    </p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  function renderDetailDialog() {
    return (
      <Dialog
        open={Boolean(detailItem)}
        onOpenChange={(open) => !open && setDetailItem(null)}
      >
        <DialogContent className="bg-background text-foreground sm:max-w-xl">
          {detailItem ? (
            <>
              <DialogHeader>
                <DialogTitle className="wrap-break-word">
                  {detailItem.title}
                </DialogTitle>
                <DialogDescription className="wrap-break-word text-muted-foreground">
                  {formatDate(detailItem.startTime, locale)},{" "}
                  {formatTime(detailItem.startTime, locale)} -{" "}
                  {formatTime(detailItem.endTime, locale)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                {renderStatusBadges(detailItem)}

                {detailItem.description && (
                  <p className="wrap-break-word whitespace-pre-wrap text-foreground">
                    {detailItem.description}
                  </p>
                )}

                <div className="grid gap-2 sm:grid-cols-2">
                  <p className="wrap-break-word">
                    <span className="font-medium text-foreground">
                      {t("coach.schedule.detailType")}
                    </span>{" "}
                    {itemTypeLabel(detailItem.type, t)}
                  </p>
                  <p className="wrap-break-word">
                    <span className="font-medium text-foreground">
                      {t("coach.schedule.detailLearnerCount")}
                    </span>{" "}
                    {detailItem.learnerCount}
                  </p>
                  {detailItem.coachName && (
                    <p className="wrap-break-word">
                      <span className="font-medium text-foreground">
                        {t("coach.schedule.detailCoach")}
                      </span>{" "}
                      {detailItem.coachName}
                    </p>
                  )}
                  {detailItem.learnerName && (
                    <p className="wrap-break-word">
                      <span className="font-medium text-foreground">
                        {t("coach.schedule.detailMainLearner")}
                      </span>{" "}
                      {detailItem.learnerName}
                    </p>
                  )}
                </div>

                {detailItem.location && (
                  <p className="wrap-break-word whitespace-pre-wrap text-foreground">
                    <span className="font-medium">
                      {t("coach.schedule.detailLocation")}
                    </span>{" "}
                    {detailItem.location}
                  </p>
                )}

                {detailItem.meetingUrl && (
                  <p className="wrap-break-word">
                    <span className="font-medium text-foreground">
                      {t("coach.schedule.meetingUrl")}:
                    </span>{" "}
                    <a
                      href={detailItem.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline underline-offset-4"
                    >
                      {detailItem.meetingUrl}
                    </a>
                  </p>
                )}

                {detailItem.learners.length > 0 && (
                  <div>
                    <span className="font-medium text-foreground">
                      {t("coach.schedule.detailLearners")}
                    </span>
                    <ul className="mt-1 list-inside list-disc space-y-1 text-muted-foreground">
                      {detailItem.learners.map((learner, index) => (
                        <li
                          key={learner.userId ?? index}
                          className="wrap-break-word"
                        >
                          {learner.name || t("coach.students.noName")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailItem(null)}>
                  {t("coach.schedule.detailClose")}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Card className="rounded-2xl border border-border bg-background shadow-sm">
          <CardContent className="p-8">
            <div className="space-y-3 overflow-x-auto">
              <div className="grid min-w-245 grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <Skeleton key={day} className="h-10 rounded-xl" />
                ))}
              </div>
              <div className="grid min-w-245 grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, index) => (
                  <Skeleton key={index} className="min-h-36 rounded-2xl" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {viewMode === "calendar"
        ? renderCalendarView()
        : viewMode === "agenda"
          ? renderAgendaView()
          : renderListView()}
      {renderDetailDialog()}
    </>
  )
}
