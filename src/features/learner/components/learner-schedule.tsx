"use client"

import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  List,
  MapPin,
  Search,
  User,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

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

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  upcoming: "secondary",
  live: "default",
  past: "outline",
  pending: "outline",
}

function getLocaleCode(language: string) {
  return language.startsWith("vi") ? "vi-VN" : "en-US"
}

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatShortDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  })
}

function formatTime(value: string, locale: string) {
  return new Date(value).toLocaleTimeString(locale, {
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

function getStatusLabel(status: string, t: (key: string) => string) {
  switch (status) {
    case "upcoming":
      return t("learner.schedule.status.upcoming")
    case "live":
      return t("learner.schedule.status.live")
    case "past":
      return t("learner.schedule.status.past")
    case "pending":
      return t("learner.schedule.status.pending")
    default:
      return t("learner.schedule.status.unknown")
  }
}

function getKindLabel(kind: string, t: (key: string) => string) {
  switch (kind) {
    case "class":
      return t("learner.schedule.kind.class")
    case "booking":
      return t("learner.schedule.kind.booking")
    default:
      return t("learner.schedule.kind.unknown")
  }
}

function getPaymentStatusLabel(
  status: string | null | undefined,
  t: (key: string) => string
) {
  switch (status) {
    case "PENDING_PROOF":
      return t("learner.schedule.paymentStatus.pendingProof")
    case "PENDING_REVIEW":
      return t("learner.schedule.paymentStatus.pendingReview")
    case "SETTLED":
      return t("learner.schedule.paymentStatus.settled")
    case "REJECTED":
      return t("learner.schedule.paymentStatus.rejected")
    default:
      return t("learner.schedule.paymentStatus.unknown")
  }
}

function getSourceStatusLabel(status: string, t: (key: string) => string) {
  switch (status) {
    case "PENDING_CONFIRMATION":
      return t("learner.schedule.sourceStatus.pendingConfirmation")
    case "CONFIRMED":
      return t("learner.schedule.sourceStatus.confirmed")
    case "COMPLETED":
      return t("learner.schedule.sourceStatus.completed")
    case "REJECTED":
      return t("learner.schedule.sourceStatus.rejected")
    case "CANCELLED":
      return t("learner.schedule.sourceStatus.cancelled")
    default:
      return t("learner.schedule.sourceStatus.unknown")
  }
}

function formatCurrency(vnd: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
  }).format(vnd)
}

function getActionLabel(action: string, t: (key: string) => string) {
  switch (action) {
    case "VIEW_CLASS":
      return t("learner.schedule.actions.viewClass")
    case "VIEW_BOOKING":
      return t("learner.schedule.actions.viewBooking")
    case "VIEW_COACH":
      return t("learner.schedule.actions.viewCoach")
    case "VIEW_COURT":
      return t("learner.schedule.actions.viewCourt")
    case "UPLOAD_PAYMENT_PROOF":
      return t("learner.schedule.actions.uploadPaymentProof")
    case "CANCEL":
      return t("learner.schedule.actions.cancel")
    case "LEAVE_REVIEW":
      return t("learner.schedule.actions.leaveReview")
    default:
      return action
  }
}

function getActionHref(item: LearnerScheduleItem, action: string) {
  switch (action) {
    case "VIEW_CLASS":
      return item.classId ? `/classes/${item.classId}` : null
    case "VIEW_BOOKING":
      return item.bookingId ? `/bookings/${item.bookingId}` : null
    case "VIEW_COACH":
      return item.coachProfile?.id ? `/coaches/${item.coachProfile.id}` : null
    case "VIEW_COURT":
      return item.courtId ? `/sport-center/${item.courtId}` : null
    case "UPLOAD_PAYMENT_PROOF":
      return item.bookingId
        ? `/bookings/${item.bookingId}?action=upload-proof`
        : null
    case "CANCEL":
      return item.bookingId ? `/bookings/${item.bookingId}?action=cancel` : null
    case "LEAVE_REVIEW":
      return item.coachProfile?.id
        ? `/coaches/${item.coachProfile.id}?tab=reviews`
        : null
    default:
      return null
  }
}

function ScheduleActionButtons({ item }: { item: LearnerScheduleItem }) {
  const { t } = useTranslation("common")
  if (!Array.isArray(item.actions) || item.actions.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {item.actions.map((action) => {
        const href = getActionHref(item, action)
        const label = getActionLabel(action, t)

        if (href) {
          return (
            <Button
              key={action}
              variant="outline"
              size="sm"
              asChild
              onClick={(event) => event.stopPropagation()}
            >
              <Link href={href}>{label}</Link>
            </Button>
          )
        }

        return (
          <Button
            key={action}
            variant="outline"
            size="sm"
            disabled
            onClick={(event) => event.stopPropagation()}
          >
            {label}
          </Button>
        )
      })}
    </div>
  )
}

/* --- Sub-components --- */

function CoachAvatar({
  avatarUrl,
  displayName,
}: {
  avatarUrl: string | null
  displayName: string | null
}) {
  const initials = (displayName ?? "").charAt(0).toUpperCase() || "U"
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
          {formatCurrency(item.priceVnd, locale)}
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

function DetailDialog({
  item,
  open,
  onOpenChange,
}: {
  item: LearnerScheduleItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t, i18n } = useTranslation("common")
  const locale = getLocaleCode(i18n.language)

  if (!item) return null

  const coachName =
    item.coachProfile?.displayName ?? t("learner.schedule.unknownCoach")
  const isVerified = item.coachProfile?.verificationStatus === "VERIFIED"
  const statusLabel = getStatusLabel(item.status, t)
  const statusVariant = STATUS_VARIANTS[item.status] ?? "outline"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {getKindLabel(item.kind, t)}
            </Badge>
            <Badge variant={statusVariant} className="rounded-full text-[10px]">
              {statusLabel}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {item.coverImageUrl && (
            <img
              src={item.coverImageUrl}
              alt={item.title}
              className="h-48 w-full rounded-lg object-cover"
            />
          )}

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
              {formatDate(item.startsAt, locale)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" />
              {formatTime(item.startsAt, locale)} -{" "}
              {formatTime(item.endsAt, locale)}{" "}
              {t("learner.schedule.detail.durationMinutes", {
                minutes: item.durationMinutes,
              })}
            </div>
          </div>

          {item.priceVnd !== null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="size-4" />
              {formatCurrency(item.priceVnd, locale)}
            </div>
          )}

          {item.locationDescription && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              {item.locationDescription}
            </div>
          )}

          {item.courtId && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="rounded-full text-[10px]">
                {t("learner.schedule.detail.courtId", { id: item.courtId })}
              </Badge>
            </div>
          )}

          {item.topic && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("learner.schedule.detail.topic")}
              </p>
              <p className="text-sm">{item.topic}</p>
            </div>
          )}

          {item.note && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("learner.schedule.detail.note")}
              </p>
              <p className="text-sm whitespace-pre-wrap">{item.note}</p>
            </div>
          )}

          {item.kind === "booking" && (
            <div className="text-sm">
              <span className="text-muted-foreground">
                {t("learner.schedule.detail.payment")}:{" "}
              </span>
              {getPaymentStatusLabel(item.paymentStatus, t)}
            </div>
          )}

          <ScheduleActionButtons item={item} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* --- Loading skeleton --- */

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

/* --- Main component --- */

export function LearnerSchedule() {
  const { t, i18n } = useTranslation("common")
  const session = useSession()
  const locale = getLocaleCode(i18n.language)

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
    {
      value: "calendar" as const,
      label: t("learner.schedule.viewModes.calendar"),
      icon: Calendar,
    },
    {
      value: "agenda" as const,
      label: t("learner.schedule.viewModes.agenda"),
      icon: List,
    },
    {
      value: "list" as const,
      label: t("learner.schedule.viewModes.list"),
      icon: Filter,
    },
  ]

  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("learner.schedule.pageTitle")}
          </h1>
        </div>
        <ScheduleSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("learner.schedule.pageTitle")}
          </h1>
        </div>
        <ErrorState
          title={t("learner.schedule.errorTitle")}
          description={getErrorMessage(error)}
          retry={refetch}
        />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {viewMode !== "list" && (
            <CalendarNavigation
              currentDate={currentDate}
              onMonthChange={monthChange}
              onYearChange={yearChange}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              onToday={goToday}
            />
          )}
          {viewMode !== "list" && (
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
          )}
        </div>

        {viewMode === "calendar" && (
          <CalendarView
            allDays={allDays}
            currentDate={currentDate}
            scheduleMap={scheduleMap}
            today={today}
            locale={locale}
            onItemClick={setDetailItem}
          />
        )}

        {viewMode === "agenda" && (
          <AgendaView
            items={filteredItems}
            locale={locale}
            onItemClick={setDetailItem}
          />
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
            locale={locale}
            viewModeSelector={
              <Select value={viewMode} onValueChange={handleViewModeChange}>
                <SelectTrigger className="h-9 w-36 rounded-full bg-background shadow-sm">
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
            }
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

/* --- Calendar View --- */

function CalendarView({
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
  const { t } = useTranslation("common")
  const weeks: Date[][] = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  const weekDayLabels = useMemo(() => {
    const reference = new Date(2024, 0, 1)
    return Array.from({ length: 7 }, (_, i) =>
      new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
        new Date(
          reference.getFullYear(),
          reference.getMonth(),
          reference.getDate() + i
        )
      )
    )
  }, [locale])

  return (
    <div className="rounded-xl border bg-background shadow-sm">
      <div className="grid grid-cols-7 border-b">
        {weekDayLabels.map((day) => (
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

/* --- Agenda View --- */

function AgendaView({
  items,
  locale,
  onItemClick,
}: {
  items: LearnerScheduleItem[]
  locale: string
  onItemClick: (item: LearnerScheduleItem) => void
}) {
  const { t } = useTranslation("common")
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
          {t("learner.schedule.empty.agenda")}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {grouped.map(([dateKey, dayItems]) => {
        const d = new Date(dateKey + "T00:00:00")
        const dayNum = d.getDate()
        const dateStr = d.toLocaleDateString(locale, {
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
                  {t("learner.schedule.agenda.sessions", {
                    count: dayItems.length,
                  })}
                </p>
              </div>
            </div>
            <div className="relative ml-5 space-y-3 border-l-2 border-muted pl-5">
              {dayItems.map((item) => (
                <AgendaItemCard
                  key={item.id}
                  item={item}
                  locale={locale}
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
  locale,
  onClick,
}: {
  item: LearnerScheduleItem
  locale: string
  onClick: () => void
}) {
  const { t } = useTranslation("common")
  const statusLabel = getStatusLabel(item.status, t)
  const statusVariant = STATUS_VARIANTS[item.status] ?? "outline"
  const coachName =
    item.coachProfile?.displayName ?? t("learner.schedule.unknownCoach")

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
              {getKindLabel(item.kind, t)}
            </Badge>
            <p className="truncate text-sm font-medium">{item.title}</p>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatTime(item.startsAt, locale)} -{" "}
              {formatTime(item.endsAt, locale)}
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
            {item.priceVnd !== null && (
              <span className="flex items-center gap-1">
                <DollarSign className="size-3.5" />
                {formatCurrency(item.priceVnd, locale)}
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

/* --- List View --- */

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
  locale,
  viewModeSelector,
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
  locale: string
  viewModeSelector?: React.ReactNode
}) {
  const { t } = useTranslation("common")

  const stateOptions = [
    { value: "all", label: t("learner.schedule.filters.state.all") },
    { value: "upcoming", label: t("learner.schedule.filters.state.upcoming") },
    { value: "live", label: t("learner.schedule.filters.state.live") },
    { value: "past", label: t("learner.schedule.filters.state.past") },
    { value: "pending", label: t("learner.schedule.filters.state.pending") },
  ]

  const kindOptions = [
    { value: "all", label: t("learner.schedule.filters.kind.all") },
    { value: "class", label: t("learner.schedule.filters.kind.class") },
    { value: "booking", label: t("learner.schedule.filters.kind.booking") },
  ]

  const sortOptions = [
    { value: "desc", label: t("learner.schedule.filters.sort.desc") },
    { value: "asc", label: t("learner.schedule.filters.sort.asc") },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("learner.schedule.filters.searchPlaceholder")}
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
              {kindOptions.map((opt) => (
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
              {stateOptions.map((opt) => (
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
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t("learner.schedule.filters.fromDate")}
            </span>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="h-9 w-36"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t("learner.schedule.filters.toDate")}
            </span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="h-9 w-36"
            />
          </div>
        </div>
        {viewModeSelector}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="mb-2 size-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            {t("learner.schedule.empty.list")}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <ListCard
                key={item.id}
                item={item}
                locale={locale}
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
  locale,
  onClick,
}: {
  item: LearnerScheduleItem
  locale: string
  onClick: () => void
}) {
  const { t } = useTranslation("common")
  const coachName =
    item.coachProfile?.displayName ?? t("learner.schedule.unknownCoach")
  const isVerified = item.coachProfile?.verificationStatus === "VERIFIED"
  const statusLabel = getStatusLabel(item.status, t)
  const statusVariant = STATUS_VARIANTS[item.status] ?? "outline"

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onClick()
        }
      }}
      className="w-full rounded-xl border bg-background p-4 text-left shadow-sm transition hover:bg-accent/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {item.coverImageUrl ? (
            <img
              src={item.coverImageUrl}
              alt={item.title}
              className="size-14 rounded-lg object-cover"
            />
          ) : (
            <CoachAvatar
              avatarUrl={item.coachProfile?.avatarUrl ?? null}
              displayName={coachName}
            />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{coachName}</span>
              {isVerified && <CheckCircle2 className="size-4 text-primary" />}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0 text-[10px]"
              >
                {getKindLabel(item.kind, t)}
              </Badge>
              {item.priceVnd !== null && (
                <Badge
                  variant="outline"
                  className="rounded-full px-2 py-0 text-[10px]"
                >
                  {formatCurrency(item.priceVnd, locale)}
                </Badge>
              )}
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
          {formatShortDate(item.startsAt, locale)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatTime(item.startsAt, locale)} -{" "}
          {formatTime(item.endsAt, locale)}
        </span>
        <span className="text-xs">
          {t("learner.schedule.detail.durationMinutes", {
            minutes: item.durationMinutes,
          })}
        </span>
      </div>

      <div className="mt-2 space-y-1 text-sm">
        {item.locationDescription && (
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {item.locationDescription}
          </p>
        )}
        {item.courtId && (
          <p className="text-muted-foreground">
            {t("learner.schedule.detail.courtId", { id: item.courtId })}
          </p>
        )}
        {item.topic && (
          <p className="text-muted-foreground">
            {t("learner.schedule.detail.topic")}: {item.topic}
          </p>
        )}
        {item.note && (
          <p className="line-clamp-2 text-muted-foreground">
            {t("learner.schedule.detail.note")}: {item.note}
          </p>
        )}
        {item.sourceStatus && (
          <Badge variant="outline" className="rounded-full text-[10px]">
            {getSourceStatusLabel(item.sourceStatus, t)}
          </Badge>
        )}
      </div>

      {item.kind === "booking" && (
        <div className="mt-2 text-sm text-muted-foreground">
          {t("learner.schedule.detail.payment")}:{" "}
          {getPaymentStatusLabel(item.paymentStatus, t)}
        </div>
      )}

      <div className="mt-3">
        <ScheduleActionButtons item={item} />
      </div>
    </div>
  )
}
