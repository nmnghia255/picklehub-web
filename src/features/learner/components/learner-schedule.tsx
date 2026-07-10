"use client"

import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  List,
  MapPin,
  Search,
  User,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { CalendarNavigation } from "@/components/calendar-navigation"
import { ErrorState } from "@/components/shared/error-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/features/auth/hooks/use-session"
import type { LearnerScheduleItem } from "@/features/coach/types/coach"
import { useLearnerSchedule } from "@/features/learner/hooks/use-learner-queries"
import { getErrorMessage } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type ViewMode = "calendar" | "agenda" | "list"

const STATE_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "upcoming", label: "Sắp tới" },
  { value: "live", label: "Đang diễn ra" },
  { value: "past", label: "Đã kết thúc" },
  { value: "pending", label: "Chờ xác nhận" },
]

const KIND_OPTIONS = [
  { value: "all", label: "Tất cả loại" },
  { value: "class", label: "Lớp học" },
  { value: "booking", label: "Đặt lịch" },
]

const SORT_OPTIONS = [
  { value: "desc", label: "Mới nhất" },
  { value: "asc", label: "Cũ nhất" },
]

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Sắp tới",
  live: "Đang diễn ra",
  past: "Đã kết thúc",
  pending: "Chờ xác nhận",
}

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  upcoming: "secondary",
  live: "default",
  past: "outline",
  pending: "outline",
}

const weekDays = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
]

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  })
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function eachDayOfInterval(start: Date, end: Date) {
  const days: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function endOfWeek(date: Date) {
  const d = startOfWeek(date)
  d.setDate(d.getDate() + 6)
  return d
}

function getToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/* ─── Sub-components ─── */

function CoachAvatar({
  avatarUrl,
  displayName,
}: {
  avatarUrl: string | null
  displayName: string | null
}) {
  const initials = (displayName ?? "?").charAt(0).toUpperCase()
  return (
    <Avatar className="size-9">
      <AvatarImage src={avatarUrl ?? ""} alt={displayName ?? ""} />
      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
    </Avatar>
  )
}

function CalendarEventCard({
  item,
  onClick,
}: {
  item: LearnerScheduleItem
  onClick: (item: LearnerScheduleItem) => void
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
      <p className="truncate font-medium">{item.title}</p>
      <p className="truncate text-muted-foreground">
        {formatTime(item.startsAt)} - {formatTime(item.endsAt)}
      </p>
      {item.coachProfile?.displayName && (
        <p className="truncate text-muted-foreground">
          {item.coachProfile.displayName}
        </p>
      )}
    </button>
  )
}

function DetailDialog({
  item,
  open,
  onOpenChange,
}: {
  item: LearnerScheduleItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!item) return null

  const coachName = item.coachProfile?.displayName ?? "Không xác định"
  const isVerified = item.coachProfile?.verificationStatus === "VERIFIED"
  const statusLabel = STATUS_LABELS[item.status] ?? item.status
  const statusVariant = STATUS_VARIANTS[item.status] ?? "outline"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {item.kind === "class" ? "Lớp học" : "Đặt lịch"}
            </Badge>
            <Badge variant={statusVariant} className="rounded-full text-[10px]">
              {statusLabel}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
          </div>

          <div className="flex items-center gap-3">
            <CoachAvatar
              avatarUrl={item.coachProfile?.avatarUrl ?? null}
              displayName={coachName}
            />
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                {coachName}
                {isVerified && <CheckCircle2 className="size-4 text-primary" />}
              </div>
              {item.coachProfile?.locationCity && (
                <p className="text-xs text-muted-foreground">
                  {item.coachProfile.locationCity}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4" />
              {formatDate(item.startsAt)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" />
              {formatTime(item.startsAt)} - {formatTime(item.endsAt)} (
              {item.durationMinutes} phút)
            </div>
          </div>

          {item.locationDescription && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              {item.locationDescription}
            </div>
          )}

          {item.topic && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Chủ đề
              </p>
              <p className="text-sm">{item.topic}</p>
            </div>
          )}

          {item.note && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Ghi chú
              </p>
              <p className="text-sm whitespace-pre-wrap">{item.note}</p>
            </div>
          )}

          {item.kind === "booking" && (
            <div className="text-sm">
              <span className="text-muted-foreground">Thanh toán: </span>
              {item.paymentStatus ?? "-"}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {item.classId && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/classes/${item.classId}`}>Xem lớp học</Link>
              </Button>
            )}
            {item.bookingId && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/bookings/${item.bookingId}`}>Xem đặt lịch</Link>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Loading skeleton ─── */

function ScheduleSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

/* ─── Main component ─── */

export function LearnerSchedule() {
  const session = useSession()

  const today = useMemo(() => getToday(), [])
  const [currentDate, setCurrentDate] = useState(today)
  const [viewMode, setViewMode] = useState<ViewMode>("calendar")
  const [page, setPage] = useState(1)
  const [state, setState] = useState("all")
  const [kind, setKind] = useState("all")
  const [sort, setSort] = useState("desc")
  const [search, setSearch] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [detailItem, setDetailItem] = useState<LearnerScheduleItem | null>(null)

  const limit = 20

  const params: Record<string, unknown> = {
    page,
    limit,
    sort,
  }
  if (state !== "all") params.state = state
  if (kind !== "all") params.kind = kind
  if (fromDate) params.from = fromDate
  if (toDate) params.to = toDate

  const { data, isLoading, error, refetch } = useLearnerSchedule(params, {
    enabled: !!session?.user,
  })

  const items = data?.data ?? []
  const pagination = data?.pagination

  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate])
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate])
  const calendarStart = useMemo(() => startOfWeek(monthStart), [monthStart])
  const calendarEnd = useMemo(() => endOfWeek(monthEnd), [monthEnd])
  const allDays = useMemo(
    () => eachDayOfInterval(calendarStart, calendarEnd),
    [calendarStart, calendarEnd]
  )

  const scheduleMap = useMemo(() => {
    const map = new Map<string, LearnerScheduleItem[]>()
    for (const item of items) {
      const key = item.startsAt.slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  }, [items])

  const monthChange = (month: number) => {
    const d = new Date(currentDate)
    d.setMonth(month)
    setCurrentDate(d)
  }

  const yearChange = (year: number) => {
    const d = new Date(currentDate)
    d.setFullYear(year)
    setCurrentDate(d)
  }

  const prevMonth = () => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() - 1)
    setCurrentDate(d)
  }

  const nextMonth = () => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() + 1)
    setCurrentDate(d)
  }

  const goToday = () => {
    setCurrentDate(today)
  }

  /* ── Filtered items for list/agenda ── */
  const filteredItems = useMemo(() => {
    let result = items
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.coachProfile?.displayName?.toLowerCase().includes(q) ||
          it.topic?.toLowerCase().includes(q)
      )
    }
    return result
  }, [items, search])

  const viewModeOptions = [
    { value: "calendar" as const, label: "Lịch", icon: Calendar },
    { value: "agenda" as const, label: "Danh sách", icon: List },
    { value: "list" as const, label: "Chi tiết", icon: Filter },
  ]

  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Lịch tập</h1>
        </div>
        <ScheduleSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Lịch tập</h1>
        </div>
        <ErrorState
          title="Không thể tải lịch tập"
          description={getErrorMessage(error)}
          retry={refetch}
        />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CalendarNavigation
            currentDate={currentDate}
            onMonthChange={monthChange}
            onYearChange={yearChange}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            onToday={goToday}
          />
          <Select value={viewMode} onValueChange={handleViewModeChange}>
            <SelectTrigger className="h-10 w-36 rounded-full bg-background shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {viewModeOptions.map((opt) => {
                const Icon = opt.icon
                return (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <Icon className="size-4" />
                      {opt.label}
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Content per view mode */}
        {viewMode === "calendar" && (
          <CalendarView
            allDays={allDays}
            currentDate={currentDate}
            scheduleMap={scheduleMap}
            today={today}
            onItemClick={setDetailItem}
          />
        )}

        {viewMode === "agenda" && (
          <AgendaView items={filteredItems} onItemClick={setDetailItem} />
        )}

        {viewMode === "list" && (
          <ListView
            items={filteredItems}
            pagination={pagination}
            page={page}
            state={state}
            kind={kind}
            sort={sort}
            search={search}
            fromDate={fromDate}
            toDate={toDate}
            onStateChange={(v) => {
              setState(v)
              setPage(1)
            }}
            onKindChange={(v) => {
              setKind(v)
              setPage(1)
            }}
            onSortChange={(v) => {
              setSort(v)
              setPage(1)
            }}
            onSearchChange={(v) => setSearch(v)}
            onFromDateChange={(v) => {
              setFromDate(v)
              setPage(1)
            }}
            onToDateChange={(v) => {
              setToDate(v)
              setPage(1)
            }}
            onPageChange={setPage}
            onItemClick={setDetailItem}
          />
        )}
      </div>

      <DetailDialog
        item={detailItem}
        open={!!detailItem}
        onOpenChange={(open) => {
          if (!open) setDetailItem(null)
        }}
      />
    </>
  )
}

/* ─── Calendar View ─── */

function CalendarView({
  allDays,
  currentDate,
  scheduleMap,
  today,
  onItemClick,
}: {
  allDays: Date[]
  currentDate: Date
  scheduleMap: Map<string, LearnerScheduleItem[]>
  today: Date
  onItemClick: (item: LearnerScheduleItem) => void
}) {
  const weeks: Date[][] = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  return (
    <div className="rounded-xl border bg-background shadow-sm">
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div
            key={day}
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
            const isToday = isSameDay(day, today)
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
                      onClick={onItemClick}
                    />
                  ))}
                  {dayItems.length > 3 && (
                    <p className="text-center text-[10px] text-muted-foreground">
                      +{dayItems.length - 3} nữa
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

/* ─── Agenda View ─── */

function AgendaView({
  items,
  onItemClick,
}: {
  items: LearnerScheduleItem[]
  onItemClick: (item: LearnerScheduleItem) => void
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, LearnerScheduleItem[]>()
    for (const item of items) {
      const key = item.startsAt.slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [items])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Calendar className="mb-2 size-10 text-muted-foreground" />
        <p className="text-muted-foreground">
          Không có lịch tập trong khoảng này
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {grouped.map(([dateKey, dayItems]) => {
        const d = new Date(dateKey + "T00:00:00")
        const dayNum = d.getDate()
        const dateStr = d.toLocaleDateString("vi-VN", {
          weekday: "long",
          month: "long",
          year: "numeric",
        })
        return (
          <div key={dateKey}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {dayNum}
              </div>
              <div>
                <p className="text-sm font-medium">{dateStr}</p>
                <p className="text-xs text-muted-foreground">
                  {dayItems.length} buổi
                </p>
              </div>
            </div>
            <div className="relative ml-5 space-y-3 border-l-2 border-muted pl-5">
              {dayItems.map((item) => (
                <AgendaItemCard
                  key={item.id}
                  item={item}
                  onClick={() => onItemClick(item)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AgendaItemCard({
  item,
  onClick,
}: {
  item: LearnerScheduleItem
  onClick: () => void
}) {
  const statusLabel = STATUS_LABELS[item.status] ?? item.status
  const statusVariant = STATUS_VARIANTS[item.status] ?? "outline"
  const coachName = item.coachProfile?.displayName ?? "Không xác định"

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border bg-background p-4 text-left shadow-sm transition hover:bg-accent/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {item.kind === "class" ? "Lớp học" : "Đặt lịch"}
            </Badge>
            <p className="truncate text-sm font-medium">{item.title}</p>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatTime(item.startsAt)} - {formatTime(item.endsAt)}
            </span>
            <span className="flex items-center gap-1">
              <User className="size-3.5" />
              {coachName}
            </span>
            {item.locationDescription && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {item.locationDescription}
              </span>
            )}
          </div>
        </div>
        <Badge
          variant={statusVariant}
          className="shrink-0 rounded-full text-[10px]"
        >
          {statusLabel}
        </Badge>
      </div>
    </button>
  )
}

/* ─── List View ─── */

function ListView({
  items,
  pagination,
  page,
  state,
  kind,
  sort,
  search,
  fromDate,
  toDate,
  onStateChange,
  onKindChange,
  onSortChange,
  onSearchChange,
  onFromDateChange,
  onToDateChange,
  onPageChange,
  onItemClick,
}: {
  items: LearnerScheduleItem[]
  pagination:
    | { page: number; limit: number; total: number; totalPages: number }
    | undefined
  page: number
  state: string
  kind: string
  sort: string
  search: string
  fromDate: string
  toDate: string
  onStateChange: (v: string) => void
  onKindChange: (v: string) => void
  onSortChange: (v: string) => void
  onSearchChange: (v: string) => void
  onFromDateChange: (v: string) => void
  onToDateChange: (v: string) => void
  onPageChange: (v: number) => void
  onItemClick: (item: LearnerScheduleItem) => void
}) {
  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-56 pl-9"
          />
        </div>
        <Select value={kind} onValueChange={onKindChange}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KIND_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={state} onValueChange={onStateChange}>
          <SelectTrigger className="h-9 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Từ:</span>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="h-9 w-36"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Đến:</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="h-9 w-36"
          />
        </div>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="mb-2 size-10 text-muted-foreground" />
          <p className="text-muted-foreground">Không có lịch tập phù hợp</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <ListCard
                key={item.id}
                item={item}
                onClick={() => onItemClick(item)}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    className={
                      page <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: pagination.totalPages }).map((_, i) => {
                  const p = i + 1
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={page === p}
                        onClick={() => onPageChange(p)}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      onPageChange(Math.min(pagination.totalPages, page + 1))
                    }
                    className={
                      page >= pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}

function ListCard({
  item,
  onClick,
}: {
  item: LearnerScheduleItem
  onClick: () => void
}) {
  const coachName = item.coachProfile?.displayName ?? "Không xác định"
  const isVerified = item.coachProfile?.verificationStatus === "VERIFIED"
  const statusLabel = STATUS_LABELS[item.status] ?? item.status
  const statusVariant = STATUS_VARIANTS[item.status] ?? "outline"

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border bg-background p-4 text-left shadow-sm transition hover:bg-accent/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CoachAvatar
            avatarUrl={item.coachProfile?.avatarUrl ?? null}
            displayName={coachName}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{coachName}</span>
              {isVerified && <CheckCircle2 className="size-4 text-primary" />}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0 text-[10px]"
              >
                {item.kind === "class" ? "Lớp học" : "Đặt lịch"}
              </Badge>
            </div>
          </div>
        </div>
        <Badge
          variant={statusVariant}
          className="shrink-0 rounded-full text-[10px]"
        >
          {statusLabel}
        </Badge>
      </div>

      <p className="mt-3 font-medium">{item.title}</p>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="size-3.5" />
          {formatShortDate(item.startsAt)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatTime(item.startsAt)} - {formatTime(item.endsAt)}
        </span>
        <span className="text-xs">({item.durationMinutes} phút)</span>
      </div>

      <div className="mt-2 space-y-1 text-sm">
        {item.locationDescription && (
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {item.locationDescription}
          </p>
        )}
        {item.topic && (
          <p className="text-muted-foreground">Chủ đề: {item.topic}</p>
        )}
        {item.note && (
          <p className="line-clamp-2 text-muted-foreground">
            Ghi chú: {item.note}
          </p>
        )}
        {item.sourceStatus && (
          <Badge variant="outline" className="rounded-full text-[10px]">
            {item.sourceStatus}
          </Badge>
        )}
      </div>

      {item.kind === "booking" && (
        <div className="mt-2 text-sm text-muted-foreground">
          Thanh toán: {item.paymentStatus ?? "-"}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {item.classId && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/classes/${item.classId}`}>Xem lớp học</Link>
          </Button>
        )}
        {item.bookingId && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/bookings/${item.bookingId}`}>Xem đặt lịch</Link>
          </Button>
        )}
      </div>
    </button>
  )
}
