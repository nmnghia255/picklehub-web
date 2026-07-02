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

import { CalendarNavigation } from "@/components/calendar-navigation"
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

import { useCoachSchedule } from "../hooks/use-coach-queries"
import type { CoachScheduleItem } from "../types/coach"

type ViewMode = "calendar" | "agenda" | "list"

const DEFAULT_LIMIT = 10
const weekDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]

const statusVariantMap: Record<CoachScheduleItem["status"], "default" | "secondary" | "outline"> = {
  upcoming: "secondary",
  live: "default",
  past: "outline",
  pending: "secondary",
}

const statusLabels: Record<CoachScheduleItem["status"], string> = {
  upcoming: "Sắp diễn ra",
  live: "Đang diễn ra",
  past: "Đã kết thúc",
  pending: "Chờ xác nhận",
}

const sourceStatusLabels: Record<string, string> = {
  PENDING_CONFIRMATION: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Đã hoàn thành",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
}

const paymentStatusLabels: Record<string, string> = {
  PENDING_PROOF: "Chờ bằng chứng",
  PENDING_REVIEW: "Chờ xác nhận",
  SETTLED: "Đã thanh toán",
  REJECTED: "Từ chối",
}

function monthRange(date: Date) {
  return {
    from: startOfMonth(date).toISOString(),
    to: endOfMonth(date).toISOString(),
  }
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
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

function itemTypeLabel(type: CoachScheduleItem["type"]) {
  return type === "class" ? "Lớp học" : "Đặt lịch"
}

export function CoachWeekSchedule() {
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

  useEffect(() => {
    if (viewMode === "list") {
      setCurrentDate(startOfMonth(new Date()))
      setSearchTerm("")
      setKind("all")
      setState("all")
      setSortOrder("desc")
      setFromDate(undefined)
      setToDate(undefined)
      setPage(1)
      return
    }

    setSearchTerm("")
    setKind("all")
    setState("all")
    setFromDate(undefined)
    setToDate(undefined)
    setPage(1)
  }, [viewMode])

  const calendarQueryRange = useMemo(() => monthRange(currentDate), [currentDate])

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

  const { data, isLoading } = useCoachSchedule(scheduleParams)
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

  useEffect(() => {
    setPage(1)
  }, [searchTerm, kind, state, fromDate, toDate])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1))
  const handleMonthChange = (month: number) => setCurrentDate((prev) => new Date(prev.getFullYear(), month, 1))
  const handleYearChange = (year: number) => setCurrentDate((prev) => new Date(year, prev.getMonth(), 1))
  const handleToday = () => setCurrentDate(startOfMonth(new Date()))

  const renderStatusBadges = (item: CoachScheduleItem) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={statusVariantMap[item.status]} className="rounded-full text-[10px]">
        {statusLabels[item.status]}
      </Badge>
      <Badge variant="outline" className="rounded-full border-border bg-background text-[10px] text-foreground">
        {itemTypeLabel(item.type)}
      </Badge>
      {item.sourceStatus && (
        <Badge variant="outline" className="rounded-full border-border bg-background text-[10px] text-foreground">
          {sourceStatusLabels[item.sourceStatus] ?? item.sourceStatus}
        </Badge>
      )}
      {item.paymentStatus && (
        <Badge variant="outline" className="rounded-full border-border bg-background text-[10px] text-foreground">
          {paymentStatusLabels[item.paymentStatus] ?? item.paymentStatus}
        </Badge>
      )}
    </div>
  )

  const CalendarViewLayout = () => (
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

        <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
          <SelectTrigger className="min-w-35 border-border bg-background text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="calendar">Calendar</SelectItem>
            <SelectItem value="agenda">Lịch trình</SelectItem>
            <SelectItem value="list">Danh sách</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl border border-border bg-background shadow-sm">
        <CardContent className="overflow-x-auto p-4">
          <div className="space-y-3 min-w-245">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div key={day} className="rounded-xl bg-muted px-3 py-2 text-center text-sm font-medium text-foreground">
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
                      isCurrentMonth ? "bg-background" : "bg-muted/40 text-muted-foreground"
                    } ${isToday ? "ring-2 ring-ring/20" : ""}`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                        {day.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px]">
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
                            <span className="truncate font-semibold text-foreground">{event.title}</span>
                            <span className="shrink-0 text-[10px] text-muted-foreground">{formatTime(event.startTime)}</span>
                          </div>
                          <div className="truncate text-[11px] text-muted-foreground">{event.location ?? "Không có địa điểm"}</div>
                        </button>
                      ))}

                      {dayEvents.length > 3 && <p className="pl-1 text-xs text-muted-foreground">+{dayEvents.length - 3} lịch khác</p>}

                      {dayEvents.length === 0 && <p className="px-1 py-3 text-center text-xs text-muted-foreground">Trống</p>}
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

  const ListViewLayout = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm theo tiêu đề, địa điểm, học viên..."
            className="w-full max-w-sm bg-background text-foreground"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-sm text-muted-foreground">Loại</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger className="min-w-40 border-border bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="class">Lớp học</SelectItem>
                <SelectItem value="booking">Đặt lịch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-sm text-muted-foreground">Trạng thái</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="min-w-35 border-border bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="upcoming">Sắp tới</SelectItem>
                <SelectItem value="live">Đang diễn ra</SelectItem>
                <SelectItem value="past">Đã qua</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-sm text-muted-foreground">Sắp xếp</Label>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="min-w-30 border-border bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Cũ nhất</SelectItem>
                <SelectItem value="desc">Mới nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-sm text-muted-foreground">Từ ngày</Label>
            <Input
              type="date"
              value={fromDate ?? ""}
              onChange={(event) => setFromDate(event.target.value || undefined)}
              className="w-42.5 bg-background text-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-sm text-muted-foreground">Đến ngày</Label>
            <Input
              type="date"
              value={toDate ?? ""}
              onChange={(event) => setToDate(event.target.value || undefined)}
              className="w-42.5 bg-background text-foreground"
            />
          </div>
        </div>

        <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
          <SelectTrigger className="min-w-35 border-border bg-background text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="calendar">Calendar</SelectItem>
            <SelectItem value="agenda">Lịch trình</SelectItem>
            <SelectItem value="list">Danh sách</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl border border-border bg-background shadow-sm">
        <CardContent className="space-y-3 p-4">
          {paginatedListItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Không có lịch nào trong khoảng thời gian này.</div>
          ) : (
            paginatedListItems.map((item) => (
              <button key={item.id} type="button" className="w-full text-left" onClick={() => setDetailItem(item)}>
                <Card className="rounded-2xl border border-border bg-background shadow-sm transition hover:bg-accent/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-foreground">{item.title}</p>
                          {renderStatusBadges(item)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(item.startTime)} · {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </p>
                        {item.description && <p className="wrap-break-word whitespace-pre-wrap text-sm text-muted-foreground">{item.description}</p>}
                      </div>

                      <div className="shrink-0 text-right text-sm text-muted-foreground">
                        <p>{item.learnerCount} học viên</p>
                        {item.location && <p className="max-w-56 wrap-break-word whitespace-pre-wrap">{item.location}</p>}
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
          Trang {page}/{totalPages}
        </p>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
            Trước
          </Button>
          <Button variant="outline" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
            Sau
          </Button>
        </div>
      </div>
    </div>
  )

  const AgendaViewLayout = () => {
    const groupedByDate = useMemo(() => {
      const map = new Map<string, CoachScheduleItem[]>()
      const sorted = [...items].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
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

          <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <SelectTrigger className="min-w-35 border-border bg-background text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Calendar</SelectItem>
              <SelectItem value="agenda">Lịch trình</SelectItem>
              <SelectItem value="list">Danh sách</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="rounded-2xl border border-border bg-background shadow-sm">
          <CardContent className="p-4">
            {sortedDates.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Không có lịch nào trong tháng này.
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
                          {dateObj.toLocaleDateString("vi-VN", {
                            weekday: "long",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <Badge variant="secondary" className="rounded-full">
                          {dayItems.length} lịch
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
                                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                  </p>
                                </div>
                                <div className="shrink-0 text-right text-sm text-muted-foreground">
                                  <p>{item.learnerCount} học viên</p>
                                  {item.location && (
                                    <p className="max-w-56 truncate">{item.location}</p>
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

  const DetailDialog = () => (
    <Dialog open={Boolean(detailItem)} onOpenChange={(open) => !open && setDetailItem(null)}>
      <DialogContent className="sm:max-w-xl bg-background text-foreground">
        {detailItem ? (
          <>
            <DialogHeader>
              <DialogTitle className="wrap-break-word">{detailItem.title}</DialogTitle>
              <DialogDescription className="wrap-break-word text-muted-foreground">
                {formatDate(detailItem.startTime)}, {formatTime(detailItem.startTime)} - {formatTime(detailItem.endTime)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              {renderStatusBadges(detailItem)}

              {detailItem.description && <p className="wrap-break-word whitespace-pre-wrap text-foreground">{detailItem.description}</p>}

              <div className="grid gap-2 sm:grid-cols-2">
                <p className="wrap-break-word">
                  <span className="font-medium text-foreground">Loại:</span> {itemTypeLabel(detailItem.type)}
                </p>
                <p className="wrap-break-word">
                  <span className="font-medium text-foreground">Số học viên:</span> {detailItem.learnerCount}
                </p>
                {detailItem.coachName && (
                  <p className="wrap-break-word">
                    <span className="font-medium text-foreground">HLV:</span> {detailItem.coachName}
                  </p>
                )}
                {detailItem.learnerName && (
                  <p className="wrap-break-word">
                    <span className="font-medium text-foreground">Học viên chính:</span> {detailItem.learnerName}
                  </p>
                )}
              </div>

              {detailItem.location && (
                <p className="wrap-break-word whitespace-pre-wrap text-foreground">
                  <span className="font-medium">Địa điểm:</span> {detailItem.location}
                </p>
              )}

              {detailItem.meetingUrl && (
                <p className="wrap-break-word">
                  <span className="font-medium text-foreground">Meeting URL:</span>{" "}
                  <a href={detailItem.meetingUrl} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
                    {detailItem.meetingUrl}
                  </a>
                </p>
              )}

              {detailItem.learners.length > 0 && (
                <div>
                  <span className="font-medium text-foreground">Học viên:</span>
                  <ul className="mt-1 list-inside list-disc space-y-1 text-muted-foreground">
                    {detailItem.learners.map((learner, index) => (
                      <li key={learner.userId ?? index} className="wrap-break-word">
                        {learner.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailItem(null)}>
                Đóng
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )

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
      {viewMode === "calendar" ? <CalendarViewLayout /> : viewMode === "agenda" ? <AgendaViewLayout /> : <ListViewLayout />}
      <DetailDialog />
    </>
  )
}