"use client"

import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  List,
  MapPin,
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
import { formatCurrency } from "@/utils/expense-utils"

import { LearnerScheduleAgendaView } from "./learner-schedule-agenda-view"
import { LearnerScheduleCalendarView } from "./learner-schedule-calendar-view"
import { LearnerScheduleListView } from "./learner-schedule-list-view"

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
function formatTime(value: string, locale: string) {
  return new Date(value).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  })
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
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return d
}
function endOfWeek(date: Date) {
  const d = startOfWeek(date)
  d.setDate(d.getDate() + 6)
  return d
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

function ScheduleActionButtons({ item }: { item: LearnerScheduleItem }) {
  const { t } = useTranslation("common")
  if (!Array.isArray(item.actions) || item.actions.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {item.actions.map((action) => {
        const href = getActionHref(item, action)
        const label = getActionLabel(action, t)
        return href ? (
          <Button
            key={action}
            variant="outline"
            size="sm"
            asChild
            onClick={(event) => event.stopPropagation()}
          >
            <Link href={href}>{label}</Link>
          </Button>
        ) : (
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {getKindLabel(item.kind, t)}
            </Badge>
            <Badge
              variant={STATUS_VARIANTS[item.status] ?? "outline"}
              className="rounded-full text-[10px]"
            >
              {getStatusLabel(item.status, t)}
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
              {formatCurrency(item.priceVnd, "VND", locale)}
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
  const params: Record<string, unknown> = { page, limit, sort }
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
      const dayItems = map.get(key) ?? []
      dayItems.push(item)
      map.set(key, dayItems)
    }
    return map
  }, [items])
  const filteredItems = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.coachProfile?.displayName?.toLowerCase().includes(q) ||
        it.topic?.toLowerCase().includes(q)
    )
  }, [items, search])
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
  if (isLoading)
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
  if (error)
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
  const changeView = (value: string) => setViewMode(value as ViewMode)
  const viewModeSelector = (
    <Select value={viewMode} onValueChange={changeView}>
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
  )
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
              onToday={() => setCurrentDate(today)}
            />
          )}
          {viewMode !== "list" && (
            <Select value={viewMode} onValueChange={changeView}>
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
          <LearnerScheduleCalendarView
            allDays={allDays}
            currentDate={currentDate}
            scheduleMap={scheduleMap}
            today={today}
            locale={locale}
            onItemClick={setDetailItem}
          />
        )}
        {viewMode === "agenda" && (
          <LearnerScheduleAgendaView
            items={filteredItems}
            locale={locale}
            onItemClick={setDetailItem}
          />
        )}
        {viewMode === "list" && (
          <LearnerScheduleListView
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
            onSearchChange={setSearch}
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
            viewModeSelector={viewModeSelector}
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
