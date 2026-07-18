"use client"

import { format } from "date-fns"
import {
  BookOpen,
  CalendarDays,
  Clock,
  DollarSign,
  MapPin,
  TrendingUp,
  User,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { ErrorState } from "@/components/shared/error-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "@/features/auth/hooks/use-session"
import { getErrorMessage } from "@/lib/api-client"

import {
  useBookingRevenue,
  useClassRevenue,
  useRevenueSummary,
} from "../hooks/use-coach-queries"

function formatVnd(amount: number) {
  const safeAmount =
    typeof amount === "number" && !Number.isNaN(amount) ? amount : 0
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(safeAmount)
}

function safeFormatDateTime(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return format(date, "dd/MM/yyyy HH:mm")
}

function safeFormatDate(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return format(date, "dd/MM/yyyy")
}

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 10 + i)

const statusBadgeVariant = (status?: string) => {
  switch (status) {
    case "OPEN":
    case "CONFIRMED":
    case "SETTLED":
      return "default" as const
    case "FULL":
    case "CANCELLED":
    case "REJECTED":
      return "destructive" as const
    case "COMPLETED":
      return "secondary" as const
    default:
      return "outline" as const
  }
}

function OverviewTab() {
  const { t } = useTranslation("common")
  const session = useSession()
  const [period, setPeriod] = useState<string>("month")
  const [year, setYear] = useState<number>(currentYear)

  const { data, isLoading, isError, error, refetch } = useRevenueSummary(
    { period, year },
    { enabled: !!session?.user }
  )

  if (isError) {
    return (
      <ErrorState
        title={t("coach.income.overviewErrorTitle")}
        description={getErrorMessage(error)}
        retry={refetch}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="mb-2 size-4" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          {t("coach.income.noData")}
        </CardContent>
      </Card>
    )
  }

  const {
    classRevenueVnd = 0,
    bookingRevenueVnd = 0,
    totalRevenueVnd = 0,
    courtCostVnd = 0,
    netRevenueVnd = 0,
    totalSettlementCount = 0,
  } = data.totals

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs">{t("coach.income.totalRevenue")}</span>
              <TrendingUp className="size-3.5" />
            </div>
            <p className="mt-1 text-xl font-semibold tracking-tight">
              {formatVnd(totalRevenueVnd)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs">{t("coach.income.classRevenue")}</span>
              <BookOpen className="size-3.5" />
            </div>
            <p className="mt-1 text-xl font-semibold tracking-tight">
              {formatVnd(classRevenueVnd)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs">
                {t("coach.income.bookingRevenue")}
              </span>
              <CalendarDays className="size-3.5" />
            </div>
            <p className="mt-1 text-xl font-semibold tracking-tight">
              {formatVnd(bookingRevenueVnd)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs">
                {t("coach.income.totalTransactions")}
              </span>
              <DollarSign className="size-3.5" />
            </div>
            <p className="mt-1 text-xl font-semibold tracking-tight">
              {totalSettlementCount}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs">{t("coach.income.courtCost")}</span>
              <DollarSign className="size-3.5" />
            </div>
            <p className="mt-1 text-xl font-semibold tracking-tight">
              {formatVnd(courtCostVnd)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs">{t("coach.income.netRevenue")}</span>
              <TrendingUp className="size-3.5" />
            </div>
            <p className="mt-1 text-xl font-semibold tracking-tight">
              {formatVnd(netRevenueVnd)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">
            {t("coach.income.periodLabel")}
          </Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">
                {t("coach.income.periodMonth")}
              </SelectItem>
              <SelectItem value="quarter">
                {t("coach.income.periodQuarter")}
              </SelectItem>
              <SelectItem value="year">
                {t("coach.income.periodYear")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">
            {t("coach.income.yearLabel")}
          </Label>
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {data.buckets.length > 0 && (
        <Card className="rounded-2xl border shadow-sm">
          <div className="p-6">
            <h3 className="mb-4 text-sm font-semibold">
              {t("coach.income.detailByPeriod")}
            </h3>
            <div className="divide-y">
              {data.buckets.map((bucket, index) => (
                <div
                  key={bucket.periodLabel ?? index}
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="text-sm font-medium">
                    {bucket.periodLabel}
                  </span>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      {t("coach.income.classLabel")}:{" "}
                      {formatVnd(bucket.classRevenueVnd)}
                    </span>
                    <span>
                      {t("coach.income.bookingLabel")}:{" "}
                      {formatVnd(bucket.bookingRevenueVnd)}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatVnd(bucket.totalRevenueVnd)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

function ClassesTab() {
  const { t } = useTranslation("common")
  const [page, setPage] = useState(1)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const limit = 10

  const statusLabel = (s?: string) => {
    const m: Record<string, string> = {
      OPEN: t("coach.income.status.open"),
      FULL: t("coach.income.status.full"),
      ONGOING: t("coach.income.status.ongoing"),
      COMPLETED: t("coach.income.status.completed"),
      CANCELLED: t("coach.income.status.cancelled"),
      DRAFT: t("coach.income.status.draft"),
    }
    return m[s ?? ""] ?? s
  }

  const { data, isLoading, isError, error, refetch } = useClassRevenue(
    {
      page,
      limit,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to + "T23:59:59.999Z").toISOString() : undefined,
    },
    { enabled: true }
  )

  if (isError) {
    return (
      <ErrorState
        title={t("coach.income.classesTabError")}
        description={getErrorMessage(error)}
        retry={refetch}
      />
    )
  }

  const items = data?.data ?? []
  const totals = data?.totals
  const pagination = data?.pagination

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t("coach.income.totalClassRevenue")}
            </p>
            <p className="mt-0.5 text-lg font-semibold">
              {formatVnd(totals?.settledRevenueVnd ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t("coach.income.totalPayments")}
            </p>
            <p className="mt-0.5 text-lg font-semibold">
              {totals?.settledEnrollmentCount ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t("coach.income.totalClassRevenue")}
            </p>
            <p className="mt-0.5 text-lg font-semibold">
              {pagination?.total ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">
            {t("coach.income.fromDate")}
          </Label>
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value)
              setPage(1)
            }}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">
            {t("coach.income.toDate")}
          </Label>
          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value)
              setPage(1)
            }}
            className="w-40"
          />
        </div>
        {(from || to) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFrom("")
              setTo("")
              setPage(1)
            }}
          >
            {t("coach.income.clearFilters")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : items.length > 0 ? (
        <>
          <div className="space-y-3">
            {items.map((item) => {
              const title =
                item.title || item.className || t("coach.income.noName")
              return (
                <Card
                  key={item.classId}
                  className="rounded-xl border shadow-sm"
                >
                  <CardContent className="flex flex-col justify-between gap-3 p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="leading-tight font-semibold">{title}</h3>
                        <p className="shrink-0 font-bold text-primary">
                          {formatVnd(item.settledRevenueVnd)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.status && (
                          <Badge
                            variant={statusBadgeVariant(item.status)}
                            className="rounded-full text-[11px]"
                          >
                            {statusLabel(item.status)}
                          </Badge>
                        )}
                        {item.level && (
                          <Badge
                            variant="outline"
                            className="rounded-full text-[11px]"
                          >
                            {item.level}
                          </Badge>
                        )}
                      </div>
                      {item.locationDescription && (
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          <span>{item.locationDescription}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <span className="flex items-center gap-1">
                        <User className="size-3.5 text-muted-foreground" />
                        {item.enrolledLearnerCount ?? 0}{" "}
                        {t("coach.income.enrolledCount", {
                          count: item.enrolledLearnerCount ?? 0,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="size-3.5 text-muted-foreground" />
                        {item.settledEnrollmentCount ?? 0}{" "}
                        {t("coach.income.paid")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {item.firstSettledAt && (
                        <span>
                          {t("coach.income.firstPayment")}:{" "}
                          {safeFormatDate(item.firstSettledAt)}
                        </span>
                      )}
                      {item.lastSettledAt && (
                        <span>
                          {t("coach.income.latestPayment")}:{" "}
                          {safeFormatDate(item.lastSettledAt)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => Math.max(1, p - 1))
                    }}
                    className={
                      page <= 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(p)
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }}
                    className={
                      page >= pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {t("coach.income.noClassData")}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function BookingsTab() {
  const { t } = useTranslation("common")
  const [page, setPage] = useState(1)

  const bookingStatusLabel = (s?: string) => {
    const m: Record<string, string> = {
      PENDING_CONFIRMATION: t("coach.income.bookingStatus.pendingConfirmation"),
      CONFIRMED: t("coach.income.bookingStatus.confirmed"),
      COMPLETED: t("coach.income.bookingStatus.completed"),
      CANCELLED: t("coach.income.bookingStatus.cancelled"),
      REJECTED: t("coach.income.bookingStatus.rejected"),
    }
    return m[s ?? ""] ?? s
  }

  const paymentStatusLabel = (s?: string) => {
    const m: Record<string, string> = {
      PENDING_PROOF: t("coach.income.paymentStatus.pendingProof"),
      PENDING_REVIEW: t("coach.income.paymentStatus.pendingReview"),
      SETTLED: t("coach.income.paymentStatus.settled"),
      REJECTED: t("coach.income.paymentStatus.rejected"),
    }
    return m[s ?? ""] ?? s
  }
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const limit = 10

  const { data, isLoading, isError, error, refetch } = useBookingRevenue(
    {
      page,
      limit,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to + "T23:59:59.999Z").toISOString() : undefined,
    },
    { enabled: true }
  )

  if (isError) {
    return (
      <ErrorState
        title={t("coach.income.bookingsTabError")}
        description={getErrorMessage(error)}
        retry={refetch}
      />
    )
  }

  const items = data?.data ?? []
  const totals = data?.totals
  const pagination = data?.pagination

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t("coach.income.totalBookingRevenue")}
            </p>
            <p className="mt-0.5 text-lg font-semibold">
              {formatVnd(totals?.settledRevenueVnd ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t("coach.income.totalPayments")}
            </p>
            <p className="mt-0.5 text-lg font-semibold">
              {totals?.settledBookingCount ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              {t("coach.income.totalBookings")}
            </p>
            <p className="mt-0.5 text-lg font-semibold">
              {pagination?.total ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">
            {t("coach.income.fromDate")}
          </Label>
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value)
              setPage(1)
            }}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">
            {t("coach.income.toDate")}
          </Label>
          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value)
              setPage(1)
            }}
            className="w-40"
          />
        </div>
        {(from || to) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFrom("")
              setTo("")
              setPage(1)
            }}
          >
            {t("coach.income.clearFilters")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : items.length > 0 ? (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <Card
                key={item.bookingId}
                className="overflow-hidden rounded-xl border shadow-sm"
              >
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage
                        src={item.learnerProfile?.avatarUrl ?? undefined}
                        alt={item.learnerProfile?.name ?? "?"}
                      />
                      <AvatarFallback>
                        {(item.learnerProfile?.name ?? "?").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1.5">
                      <p className="font-semibold">
                        {item.learnerProfile?.name || t("coach.income.noName")}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="size-3.5 shrink-0" />
                        {safeFormatDateTime(item.sessionAt)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("coach.bookings.minutes", {
                          count: item.durationMinutes ?? 0,
                        })}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.status && (
                          <Badge
                            variant={statusBadgeVariant(item.status)}
                            className="rounded-full text-[11px]"
                          >
                            {bookingStatusLabel(item.status)}
                          </Badge>
                        )}
                        {item.paymentStatus && (
                          <Badge
                            variant={statusBadgeVariant(item.paymentStatus)}
                            className="rounded-full text-[11px]"
                          >
                            {paymentStatusLabel(item.paymentStatus)}
                          </Badge>
                        )}
                      </div>
                      {item.coachNote && (
                        <p className="text-xs text-muted-foreground italic">
                          {t("coach.income.notePrefix", {
                            note: item.coachNote,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 sm:shrink-0">
                    <p className="font-bold text-primary">
                      {formatVnd(item.priceVnd)}
                    </p>
                    <div className="space-y-0.5 text-right text-xs text-muted-foreground">
                      <p>
                        {t("coach.income.courtCost")}:{" "}
                        {item.courtCostVnd !== null
                          ? formatVnd(item.courtCostVnd)
                          : t("coach.income.notApplicable")}
                      </p>
                      <p>
                        {t("coach.income.netRevenue")}:{" "}
                        {formatVnd(item.netRevenueVnd)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.settledAt
                        ? safeFormatDate(item.settledAt)
                        : t("coach.income.notPaid")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => Math.max(1, p - 1))
                    }}
                    className={
                      page <= 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(p)
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }}
                    className={
                      page >= pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {t("coach.income.noBookingData")}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function CoachIncomeOverview() {
  const { t } = useTranslation("common")
  const searchParams = useSearchParams()
  const router = useRouter()
  const section = searchParams.get("section") ?? "overview"

  const handleSectionChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("section", value)
      router.replace(`/coach?${params.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  return (
    <Tabs
      value={section}
      onValueChange={handleSectionChange}
      className="w-full gap-6"
    >
      <TabsList
        variant="line"
        className="w-full min-w-0 flex-wrap justify-start gap-1 overflow-x-auto pb-1"
      >
        <TabsTrigger value="overview" className="sm:flex-none">
          {t("coach.income.overviewTitle")}
        </TabsTrigger>
        <TabsTrigger value="classes" className="sm:flex-none">
          {t("coach.income.classRevenue")}
        </TabsTrigger>
        <TabsTrigger value="bookings" className="sm:flex-none">
          {t("coach.income.bookingRevenue")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 w-full min-w-0">
        <OverviewTab />
      </TabsContent>

      <TabsContent value="classes" className="mt-6 w-full min-w-0">
        <ClassesTab />
      </TabsContent>

      <TabsContent value="bookings" className="mt-6 w-full min-w-0">
        <BookingsTab />
      </TabsContent>
    </Tabs>
  )
}
