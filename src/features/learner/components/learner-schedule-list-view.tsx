import { Calendar, CheckCircle2, Clock, MapPin, Search } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import type { LearnerScheduleItem } from "@/features/coach/types/coach"
import { formatCurrency } from "@/utils/expense-utils"

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  upcoming: "secondary",
  live: "default",
  past: "outline",
  pending: "outline",
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

function getStatusLabel(status: string, t: (key: string) => string) {
  return t(
    `learner.schedule.status.${status in STATUS_VARIANTS ? status : "unknown"}`
  )
}

function getKindLabel(kind: string, t: (key: string) => string) {
  return t(
    `learner.schedule.kind.${kind === "class" || kind === "booking" ? kind : "unknown"}`
  )
}

function getPaymentStatusLabel(
  status: string | null | undefined,
  t: (key: string) => string
) {
  const key =
    status === "PENDING_PROOF"
      ? "pendingProof"
      : status === "PENDING_REVIEW"
        ? "pendingReview"
        : status === "SETTLED"
          ? "settled"
          : status === "REJECTED"
            ? "rejected"
            : "unknown"
  return t(`learner.schedule.paymentStatus.${key}`)
}

function getSourceStatusLabel(status: string, t: (key: string) => string) {
  const key =
    status === "PENDING_CONFIRMATION"
      ? "pendingConfirmation"
      : status === "CONFIRMED"
        ? "confirmed"
        : status === "COMPLETED"
          ? "completed"
          : status === "REJECTED"
            ? "rejected"
            : status === "CANCELLED"
              ? "cancelled"
              : "unknown"
  return t(`learner.schedule.sourceStatus.${key}`)
}

function getActionLabel(action: string, t: (key: string) => string) {
  const key =
    action === "VIEW_CLASS"
      ? "viewClass"
      : action === "VIEW_BOOKING"
        ? "viewBooking"
        : action === "VIEW_COACH"
          ? "viewCoach"
          : action === "VIEW_COURT"
            ? "viewCourt"
            : action === "UPLOAD_PAYMENT_PROOF"
              ? "uploadPaymentProof"
              : action === "CANCEL"
                ? "cancel"
                : action === "LEAVE_REVIEW"
                  ? "leaveReview"
                  : null
  return key ? t(`learner.schedule.actions.${key}`) : action
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
                  {formatCurrency(item.priceVnd, "VND", locale)}
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

export function LearnerScheduleListView({
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
  const stateOptions = ["all", "upcoming", "live", "past", "pending"].map(
    (value) => ({ value, label: t(`learner.schedule.filters.state.${value}`) })
  )
  const kindOptions = ["all", "class", "booking"].map((value) => ({
    value,
    label: t(`learner.schedule.filters.kind.${value}`),
  }))
  const sortOptions = ["desc", "asc"].map((value) => ({
    value,
    label: t(`learner.schedule.filters.sort.${value}`),
  }))
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
