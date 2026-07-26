"use client"

import {
  ArrowLeft,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  Filter,
  Globe,
  Info,
  List,
  MapPin,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  User,
  Users,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { CalendarNavigation } from "@/components/calendar-navigation"
import { ErrorState } from "@/components/shared/error-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "@/features/auth/hooks/use-session"
import { CourtBookingLocationFields } from "@/features/coach/components/court-booking-location-fields"
import {
  type CourtBookingCourtSelection,
  type CourtBookingSelection,
  getBookingDateKey,
} from "@/features/coach/hooks/use-coach-court-bookings"
import {
  useCoachOpenClasses,
  useCoachPublicProfile,
  useCoachReviews,
  useCreateReview,
  useDeleteReview,
  useUpdateReview,
} from "@/features/coach/hooks/use-coach-queries"
import type {
  Certification,
  CoachLevel,
  CoachProfile,
  LearnerScheduleItem,
  VerificationStatus,
} from "@/features/coach/types/coach"
import { LearnerCoachRecommendationDialog } from "@/features/learner/components/learner-coach-recommendation-dialog"
import {
  useCreateBooking,
  useEnrollInClass,
  useLearnerSchedule,
} from "@/features/learner/hooks/use-learner-queries"
import { getTranslationStringArray } from "@/i18n/get-translation-array"
import { cn } from "@/lib/utils"
import { formatCurrency as formatCurrencyValue } from "@/utils/expense-utils"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted-foreground"
          }`}
        />
      ))}
    </div>
  )
}

function getLocaleCode(language: string) {
  return language.startsWith("vi") ? "vi-VN" : "en-US"
}

function getLevelLabel(t: (key: string) => string, level: CoachLevel) {
  return {
    Beginner: t("coach.discovery.levelLabels.beginner"),
    Intermediate: t("coach.discovery.levelLabels.intermediate"),
    Advanced: t("coach.discovery.levelLabels.advanced"),
    Pro: t("coach.discovery.levelLabels.pro"),
  }[level]
}

function formatRelativeTime(dateStr: string, locale: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  if (minutes < 1) return rtf.format(0, "minute")
  if (minutes < 60) return rtf.format(-minutes, "minute")
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return rtf.format(-hours, "hour")
  const days = Math.floor(hours / 24)
  if (days < 7) return rtf.format(-days, "day")
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return rtf.format(-weeks, "week")
  const months = Math.floor(days / 30)
  if (months < 12) return rtf.format(-months, "month")
  const years = Math.floor(days / 365)
  return rtf.format(-years, "year")
}

function formatScheduleDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  })
}

function formatBookingInputDate(date: string) {
  return date.slice(0, 10)
}

function getCourtSlotDurationMinutes(slot: CourtBookingCourtSelection) {
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }
  const start = toMinutes(slot.startTime)
  const end = toMinutes(slot.endTime)
  return end > start ? end - start : end + 24 * 60 - start
}

function formatScheduleTime(value: string, locale: string) {
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

function getCertBadgeVariant(status: VerificationStatus) {
  switch (status) {
    case "VERIFIED":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
    case "UNVERIFIED":
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
  }
}

function OverviewTab({ coach }: { coach: CoachProfile }) {
  const { t, i18n } = useTranslation("common")
  const locale = getLocaleCode(i18n.language)
  const { data: reviewsData, isLoading: reviewsLoading } = useCoachReviews(
    coach.id
  )
  const { data: classes, isLoading: classesLoading } = useCoachOpenClasses(
    coach.id
  )
  const reviews = reviewsData?.reviews ?? []

  return (
    <div className="space-y-6">
      {coach.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="size-5" />
              {t("coach.discovery.aboutTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-muted-foreground">
              {coach.bio}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="size-5" />
            {t("coach.discovery.infoTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t("coach.discovery.experienceLabel")}
              </p>
              <p className="flex items-center gap-1 font-medium">
                <Clock className="size-4" />
                {t("coach.discovery.yearsExperience", {
                  years: coach.yearsExperience,
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t("coach.discovery.specialtiesLabel")}
              </p>
              <div className="flex flex-wrap gap-1">
                {coach.specialties.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t("coach.discovery.languagesLabel")}
              </p>
              <p className="flex items-center gap-1 font-medium">
                <Globe className="size-4" />
                {coach.languages.join(", ")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t("coach.discovery.priceLabel")}
              </p>
              <p className="flex items-center gap-1 font-medium">
                <Clock className="size-4" />
                {formatCurrencyValue(coach.hourlyRateVnd, "VND", locale)}{" "}
                {t("coach.discovery.perHour")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {coach.certifications && coach.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BadgeCheck className="size-5" />
              {t("coach.discovery.certificationsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coach.certifications.map((cert: Certification) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{cert.name}</p>
                    {cert.issuingOrganization && (
                      <p className="text-sm text-muted-foreground">
                        {cert.issuingOrganization}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t("coach.discovery.issuedDate", {
                        date: new Date(cert.issuedAt).toLocaleDateString(
                          locale
                        ),
                      })}
                      {cert.expiresAt &&
                        t("coach.discovery.expiresDate", {
                          date: new Date(cert.expiresAt).toLocaleDateString(
                            locale
                          ),
                        })}
                    </p>
                  </div>
                  <Badge
                    className={getCertBadgeVariant(cert.verificationStatus)}
                  >
                    {cert.verificationStatus === "VERIFIED" &&
                      t("coach.discovery.certVerified")}
                    {cert.verificationStatus === "UNVERIFIED" &&
                      t("coach.discovery.certUnverified")}
                    {cert.verificationStatus === "PENDING" &&
                      t("coach.discovery.certPending")}
                    {cert.verificationStatus === "REJECTED" &&
                      t("coach.discovery.certRejected")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="size-5" />
            {t("coach.discovery.reviewsSectionTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold">
                {coach.averageRating.toFixed(1)}
              </p>
              <StarRating rating={coach.averageRating} />
            </div>
            <Separator orientation="vertical" className="h-16" />
            <div>
              <p className="text-sm text-muted-foreground">
                {t("coach.discovery.reviewCount", { count: coach.reviewCount })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {reviewsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="size-5" />
              {t("coach.discovery.reviewsFromLearners")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviews.slice(0, 5).map((review, idx) => (
                <div
                  key={review.reviewId ?? `review-${idx}`}
                  className="flex gap-4"
                >
                  <Avatar size="default">
                    <AvatarImage
                      src={review.reviewerProfile.avatar ?? ""}
                      alt={review.reviewerProfile.name}
                    />
                    <AvatarFallback>
                      {review.reviewerProfile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{review.reviewerProfile.name}</p>
                    <StarRating rating={review.rating} />
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(review.createdAt, locale)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="size-5" />
            {t("coach.discovery.classesTab")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {classesLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : !classes || classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <BookOpen className="mb-2 size-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                {t("coach.discovery.noClasses")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((cls, idx) => (
                <div
                  key={cls.id ?? `class-${idx}`}
                  className="rounded-lg border p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{cls.title}</h3>
                        <Badge variant="outline">
                          {getLevelLabel(t, cls.level)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {formatCurrencyValue(cls.priceVnd, "VND", locale)}
                        </span>
                        <span className="text-muted-foreground">
                          {t("coach.discovery.enrolledCount", {
                            enrolled: cls.enrolledCount,
                            capacity: cls.capacity,
                          })}
                        </span>
                      </div>
                      {cls.schedules && cls.schedules.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="size-4" />
                          {cls.schedules.slice(0, 3).map((sched, sIdx) => (
                            <span
                              key={sched.id ?? `sched-${sIdx}`}
                              className="rounded-md border px-2 py-0.5 text-xs"
                            >
                              {new Date(sched.scheduledAt).toLocaleDateString(
                                locale,
                                {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

type ViewMode = "calendar" | "agenda" | "list"

function ScheduleItemCard({
  item,
  onClick,
}: {
  item: LearnerScheduleItem
  onClick: (item: LearnerScheduleItem) => void
}) {
  const { t, i18n } = useTranslation("common")
  const locale = getLocaleCode(i18n.language)
  const coachName = item.coachProfile?.displayName ?? ""
  const STATUS_LABEL: Record<string, string> = {
    upcoming: t("coach.schedule.statusUpcoming"),
    live: t("coach.schedule.statusLive"),
    past: t("coach.schedule.statusPast"),
    pending: t("coach.schedule.statusPending"),
  }
  const statusLabel = STATUS_LABEL[item.status] ?? item.status

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="w-full rounded-xl border bg-background p-4 text-left shadow-sm transition hover:bg-accent/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {item.kind === "class"
                ? t("coach.discovery.scheduleClass")
                : t("coach.discovery.scheduleBooking")}
            </Badge>
            <p className="truncate text-sm font-medium">{item.title}</p>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatScheduleTime(item.startsAt, locale)} -{" "}
              {formatScheduleTime(item.endsAt, locale)}
            </span>
            <span>
              ({item.durationMinutes}{" "}
              {t("coach.bookings.minutes", {
                count: item.durationMinutes,
              })}
              )
            </span>
            {coachName && (
              <span className="flex items-center gap-1">
                <User className="size-3.5" />
                {coachName}
              </span>
            )}
            {item.locationDescription && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {item.locationDescription}
              </span>
            )}
          </div>
          {item.topic && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("coach.discovery.scheduleDetailTopic", { topic: item.topic })}
            </p>
          )}
        </div>
        <Badge className="shrink-0 rounded-full text-[10px]">
          {statusLabel}
        </Badge>
      </div>
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

  const STATUS_LABEL: Record<string, string> = {
    upcoming: t("coach.schedule.statusUpcoming"),
    live: t("coach.schedule.statusLive"),
    past: t("coach.schedule.statusPast"),
    pending: t("coach.schedule.statusPending"),
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {item.kind === "class"
                ? t("coach.discovery.scheduleClass")
                : t("coach.discovery.scheduleBooking")}
            </Badge>
            <Badge className="rounded-full text-[10px]">
              {STATUS_LABEL[item.status] ?? item.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="size-4" />
            {formatScheduleDate(item.startsAt, locale)}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {formatScheduleTime(item.startsAt, locale)} -{" "}
            {formatScheduleTime(item.endsAt, locale)}
          </div>
          <p className="text-sm text-muted-foreground">
            {t("coach.discovery.scheduleDetailDuration", {
              minutes: item.durationMinutes,
            })}
          </p>
          {item.coachProfile?.displayName && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <User className="size-4" />
              {item.coachProfile.displayName}
            </div>
          )}
          {item.locationDescription && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {item.locationDescription}
            </div>
          )}
          {item.topic && (
            <p className="text-sm text-muted-foreground">
              {t("coach.discovery.scheduleDetailTopic", { topic: item.topic })}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("coach.discovery.scheduleClose")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ScheduleTab({ coachId }: { coachId: string }) {
  const { t, i18n } = useTranslation("common")
  const locale = getLocaleCode(i18n.language)
  const session = useSession()

  const STATUS_OPTIONS = [
    { value: "all", label: t("coach.discovery.scheduleAllStatus") },
    { value: "upcoming", label: t("coach.discovery.scheduleUpcoming") },
    { value: "live", label: t("coach.discovery.scheduleLive") },
    { value: "past", label: t("coach.discovery.schedulePast") },
    { value: "pending", label: t("coach.discovery.schedulePending") },
  ]

  const KIND_OPTIONS_SCHEDULE = [
    { value: "all", label: t("coach.discovery.scheduleAllKind") },
    { value: "class", label: t("coach.discovery.scheduleClass") },
    { value: "booking", label: t("coach.discovery.scheduleBooking") },
  ]

  const [state, setState] = useState<string>("all")
  const { data, isLoading, error, refetch } = useLearnerSchedule(
    {
      coachProfileId: coachId,
      ...(state !== "all" ? { state } : {}),
      sort: "asc",
      limit: 50,
    },
    { enabled: !!session?.user }
  )

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const [viewMode, setViewMode] = useState<ViewMode>("calendar")
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(1)
    return d
  })
  const [selectedItem, setSelectedItem] = useState<LearnerScheduleItem | null>(
    null
  )
  const [search, setSearch] = useState("")
  const [kind, setKind] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  /* ── Calendar calculations ── */

  const monthStart = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    [currentDate]
  )
  const monthEnd = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    [currentDate]
  )

  const calendarStart = useMemo(() => {
    const d = new Date(monthStart)
    const day = d.getDay()
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    return d
  }, [monthStart])

  const calendarEnd = useMemo(() => {
    const d = new Date(monthEnd)
    const day = d.getDay()
    d.setDate(d.getDate() + (day === 0 ? 0 : 7 - day))
    return d
  }, [monthEnd])

  const allDays = useMemo(() => {
    const days: Date[] = []
    const current = new Date(calendarStart)
    while (current <= calendarEnd) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }, [calendarStart, calendarEnd])

  const scheduleMap = useMemo(() => {
    const map = new Map<string, LearnerScheduleItem[]>()
    if (!data?.data) return map
    for (const item of data.data) {
      const key = item.startsAt.slice(0, 10)
      const dayItems = map.get(key) ?? []
      dayItems.push(item)
      map.set(key, dayItems)
    }
    return map
  }, [data])

  /* ── Filtered items ── */

  const filteredItems = useMemo(() => {
    let result = data?.data ?? []
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.coachProfile?.displayName?.toLowerCase().includes(q) ||
          it.topic?.toLowerCase().includes(q)
      )
    }
    if (kind !== "all") result = result.filter((it) => it.kind === kind)
    if (fromDate)
      result = result.filter((it) => it.startsAt.slice(0, 10) >= fromDate)
    if (toDate)
      result = result.filter((it) => it.startsAt.slice(0, 10) <= toDate)
    return result
  }, [data?.data, search, kind, fromDate, toDate])

  /* ── Navigation handlers ── */

  const prevMonth = () =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    )
  const nextMonth = () =>
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    )
  const goToday = () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(1)
    setCurrentDate(d)
  }

  const weekDays = getTranslationStringArray(
    i18n,
    "common",
    "coach.schedule.weekDays"
  )

  const weeks: Date[][] = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  const viewModeOptions = [
    {
      value: "calendar" as const,
      label: t("coach.schedule.viewCalendar"),
      icon: Calendar,
    },
    {
      value: "agenda" as const,
      label: t("coach.schedule.viewAgenda"),
      icon: List,
    },
    {
      value: "list" as const,
      label: t("coach.schedule.viewList"),
      icon: Filter,
    },
  ]

  const viewModeSelect = (
    <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
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

  const calendarNav = (
    <CalendarNavigation
      currentDate={currentDate}
      onMonthChange={(month) =>
        setCurrentDate((prev) => new Date(prev.getFullYear(), month, 1))
      }
      onYearChange={(year) =>
        setCurrentDate((prev) => new Date(year, prev.getMonth(), 1))
      }
      onPrevMonth={prevMonth}
      onNextMonth={nextMonth}
      onToday={goToday}
    />
  )

  return (
    <div className="space-y-4">
      {/* ── Calendar toolbar ── */}
      {viewMode === "calendar" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {calendarNav}
          {viewModeSelect}
        </div>
      )}

      {/* ── Agenda toolbar ── */}
      {viewMode === "agenda" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {calendarNav}
          {viewModeSelect}
        </div>
      )}

      {/* ── List toolbar ── */}
      {viewMode === "list" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("coach.discovery.scheduleSearchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-48 pl-9"
              />
            </div>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KIND_OPTIONS_SCHEDULE.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("coach.discovery.scheduleFrom")}
              </span>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-9 w-34"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("coach.discovery.scheduleTo")}
              </span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-9 w-34"
              />
            </div>
          </div>
          {viewModeSelect}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <ErrorState retry={refetch} />
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="mb-2 size-10 text-muted-foreground" />
          <p className="text-lg font-medium">
            {t("coach.discovery.scheduleNoResults")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("coach.discovery.scheduleNoResultsHint")}
          </p>
        </div>
      ) : (
        <>
          {/* ── Calendar view ── */}
          {viewMode === "calendar" && (
            <div className="rounded-xl border bg-background shadow-sm">
              <div className="grid grid-cols-7 border-b">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-xs font-semibold text-muted-foreground"
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
                    const isTodayDate = isSameDay(day, today)
                    const isCurrentMonth =
                      day.getMonth() === currentDate.getMonth()

                    return (
                      <div
                        key={dateKey}
                        className={cn(
                          "min-h-24 border-t border-r p-1 last:border-r-0",
                          !isCurrentMonth && "bg-muted/30"
                        )}
                      >
                        <div className="mb-1 flex justify-center">
                          <span
                            className={cn(
                              "inline-flex size-6 items-center justify-center rounded-full text-xs",
                              isTodayDate &&
                                "bg-primary font-semibold text-primary-foreground",
                              !isTodayDate &&
                                !isCurrentMonth &&
                                "text-muted-foreground"
                            )}
                          >
                            {day.getDate()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {dayItems.slice(0, 3).map((item) => {
                            const isPast = item.status === "past"
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setSelectedItem(item)}
                                className={cn(
                                  "w-full rounded-md border-l-4 px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent",
                                  item.kind === "class"
                                    ? "border-l-blue-500 bg-blue-50 dark:bg-blue-950"
                                    : "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950",
                                  isPast && "opacity-55"
                                )}
                              >
                                <p className="truncate font-medium">
                                  {item.title}
                                </p>
                                <p className="truncate text-muted-foreground">
                                  {formatScheduleTime(item.startsAt, locale)} -{" "}
                                  {formatScheduleTime(item.endsAt, locale)}
                                </p>
                                {item.coachProfile?.displayName && (
                                  <p className="truncate text-muted-foreground">
                                    {item.coachProfile.displayName}
                                  </p>
                                )}
                              </button>
                            )
                          })}
                          {dayItems.length > 3 && (
                            <p className="text-center text-[10px] text-muted-foreground">
                              {t("coach.schedule.moreEvents", {
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
          )}

          {/* ── Agenda view ── */}
          {viewMode === "agenda" && (
            <div className="space-y-6">
              {(() => {
                const grouped = new Map<string, LearnerScheduleItem[]>()
                for (const item of filteredItems) {
                  const key = item.startsAt.slice(0, 10)
                  const dayItems = grouped.get(key) ?? []
                  dayItems.push(item)
                  grouped.set(key, dayItems)
                }
                const sortedDates = Array.from(grouped.keys()).sort()
                return sortedDates.map((dateKey) => {
                  const dayItems = grouped.get(dateKey) ?? []
                  const d = new Date(dateKey + "T00:00:00")
                  return (
                    <div key={dateKey}>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {d.getDate()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {formatScheduleDate(dateKey, locale)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("coach.schedule.learnerCount", {
                              count: dayItems.length,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="relative ml-5 space-y-3 border-l-2 border-muted pl-5">
                        {dayItems.map((item) => (
                          <ScheduleItemCard
                            key={item.id}
                            item={item}
                            onClick={setSelectedItem}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}

          {/* ── List view ── */}
          {viewMode === "list" && (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <ScheduleItemCard
                  key={item.id}
                  item={item}
                  onClick={setSelectedItem}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Detail dialog */}
      <DetailDialog
        item={selectedItem}
        open={!!selectedItem}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null)
        }}
      />
    </div>
  )
}

function ReviewsTab({ coachId }: { coachId: string }) {
  const { t, i18n } = useTranslation("common")
  const locale = getLocaleCode(i18n.language)
  const session = useSession()
  const isLearner = !!session?.user
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const createReview = useCreateReview()
  const updateReview = useUpdateReview()
  const deleteReview = useDeleteReview()

  const { data, isLoading, error } = useCoachReviews(coachId)
  const reviews = data?.reviews ?? []

  const handleSubmitReview = async () => {
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error(t("coach.reviews.ratingRequired"))
      return
    }
    try {
      await createReview.mutateAsync({
        coachId,
        dto: { rating: reviewRating, comment: reviewComment || undefined },
      })
      toast.success(t("coach.reviews.submitSuccess"))
      setReviewOpen(false)
      setReviewComment("")
    } catch {
      toast.error(t("coach.reviews.submitError"))
    }
  }

  const handleStartEdit = (review: {
    reviewId: string
    rating: number
    comment: string | null
  }) => {
    setEditingReviewId(review.reviewId)
    setEditRating(review.rating)
    setEditComment(review.comment ?? "")
  }

  const handleSaveEdit = async () => {
    if (!editingReviewId) return
    if (editRating < 1 || editRating > 5) {
      toast.error(t("coach.reviews.ratingRequired"))
      return
    }
    try {
      await updateReview.mutateAsync({
        coachId,
        reviewId: editingReviewId,
        dto: { rating: editRating, comment: editComment || undefined },
      })
      toast.success(t("coach.reviews.updateSuccess"))
      setEditingReviewId(null)
    } catch {
      toast.error(t("coach.reviews.updateError"))
    }
  }

  const handleDeleteReview = async () => {
    if (!deleteConfirmId) return
    try {
      await deleteReview.mutateAsync({ coachId, reviewId: deleteConfirmId })
      toast.success(t("coach.reviews.deleteSuccess"))
      setDeleteConfirmId(null)
    } catch {
      toast.error(t("coach.reviews.deleteError"))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive">{t("coach.reviews.errorLoading")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {isLearner && (
        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Star className="size-4" />
              {t("coach.reviews.writeReview")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("coach.reviews.writeReviewTitle")}</DialogTitle>
              <DialogDescription>
                {t("coach.reviews.writeReviewDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("coach.reviews.ratingLabel")}</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`size-8 ${star <= reviewRating ? "text-yellow-400" : "text-muted"}`}
                    >
                      <Star className="size-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("coach.reviews.commentLabel")}</Label>
                <textarea
                  className="w-full rounded-md border p-2 text-sm"
                  rows={4}
                  placeholder={t("coach.reviews.commentPlaceholder")}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewOpen(false)}>
                {t("coach.reviews.cancelButton")}
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={createReview.isPending}
              >
                {createReview.isPending
                  ? t("coach.reviews.submitting")
                  : t("coach.reviews.submitButton")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="mb-2 size-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              {t("coach.reviews.noReviewsPage")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-6 pt-6">
            {reviews.map((review, idx) => {
              const isOwnReview =
                session?.user?.id &&
                review.reviewerProfile.userId === session.user.id
              const isEditing = editingReviewId === review.reviewId

              if (isEditing) {
                return (
                  <div
                    key={review.reviewId ?? `review-${idx}`}
                    className="flex gap-4 rounded-lg border p-4"
                  >
                    <Avatar size="default">
                      <AvatarImage
                        src={review.reviewerProfile.avatar ?? ""}
                        alt={review.reviewerProfile.name}
                      />
                      <AvatarFallback>
                        {review.reviewerProfile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium">
                        {review.reviewerProfile.name}
                      </p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className={`size-6 ${star <= editRating ? "text-yellow-400" : "text-muted"}`}
                          >
                            <Star className="size-6 fill-current" />
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="w-full rounded-md border p-2 text-sm"
                        rows={3}
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={updateReview.isPending}
                        >
                          {updateReview.isPending
                            ? t("coach.reviews.saving")
                            : t("coach.reviews.saveButton")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingReviewId(null)}
                        >
                          {t("coach.reviews.cancelEditButton")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={review.reviewId ?? `review-${idx}`}
                  className="flex gap-4"
                >
                  <Avatar size="default">
                    <AvatarImage
                      src={review.reviewerProfile.avatar ?? ""}
                      alt={review.reviewerProfile.name}
                    />
                    <AvatarFallback>
                      {review.reviewerProfile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {review.reviewerProfile.name}
                      </p>
                      {isOwnReview && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(review)}
                            className="text-muted-foreground hover:text-foreground"
                            title={t("coach.reviews.editTooltip")}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(review.reviewId)}
                            className="text-muted-foreground hover:text-destructive"
                            title={t("coach.reviews.deleteTooltip")}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <StarRating rating={review.rating} />
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(review.createdAt, locale)}
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("coach.reviews.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("coach.reviews.deleteDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              {t("coach.reviews.deleteCancelButton")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReview}
              disabled={deleteReview.isPending}
            >
              {deleteReview.isPending
                ? t("coach.reviews.deleting")
                : t("coach.reviews.deleteConfirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ClassesTab({ coachId }: { coachId: string }) {
  const { t, i18n } = useTranslation("common")
  const locale = getLocaleCode(i18n.language)
  const session = useSession()
  const isLearner = !!session?.user
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const enrollMutation = useEnrollInClass()

  const { data: classes, isLoading, error } = useCoachOpenClasses(coachId)

  const handleEnroll = async (classId: string) => {
    setEnrollingId(classId)
    try {
      await enrollMutation.mutateAsync(classId)
      toast.success(t("coach.discovery.enrollSuccess"))
    } catch {
      toast.error(t("coach.discovery.enrollError"))
    } finally {
      setEnrollingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive">
            {t("coach.discovery.classesLoadError")}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!classes || classes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="mb-2 size-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            {t("coach.discovery.noOpenClasses")}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {classes.map((cls, idx) => (
        <Card key={cls.id ?? `class-${idx}`}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{cls.title}</h3>
                  <Badge variant="outline">{getLevelLabel(t, cls.level)}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrencyValue(cls.priceVnd, "VND", locale)}
                  </span>
                  <span className="text-muted-foreground">
                    {t("coach.discovery.enrolledCount", {
                      enrolled: cls.enrolledCount,
                      capacity: cls.capacity,
                    })}
                  </span>
                </div>
                {cls.schedules && cls.schedules.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4" />
                    {cls.schedules.map((sched, sIdx) => (
                      <span
                        key={sched.id ?? `sched-${sIdx}`}
                        className="rounded-md border px-2 py-0.5 text-xs"
                      >
                        {new Date(sched.scheduledAt).toLocaleDateString(
                          locale,
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="shrink-0">
                {isLearner && cls.status === "OPEN" && (
                  <Button
                    size="sm"
                    onClick={() => handleEnroll(cls.id)}
                    disabled={enrollingId === cls.id}
                  >
                    {enrollingId === cls.id
                      ? t("coach.discovery.enrolling")
                      : t("coach.discovery.enrollButton")}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function InfoTab({ coach }: { coach: CoachProfile }) {
  const { t, i18n } = useTranslation("common")
  const locale = getLocaleCode(i18n.language)
  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("coach.discovery.experienceLabel")}
              </p>
              <p className="font-medium">
                {t("coach.discovery.yearsExperience", {
                  years: coach.yearsExperience,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("coach.discovery.pricePerHourLabel")}
              </p>
              <p className="font-medium">
                {formatCurrencyValue(coach.hourlyRateVnd, "VND", locale)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("coach.discovery.city")}
              </p>
              <p className="font-medium">{coach.locationCity}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("coach.discovery.specialtiesLabel")}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {coach.specialties.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("coach.discovery.languagesLabel")}
              </p>
              <p className="font-medium">{coach.languages.join(", ")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("coach.discovery.verificationStatus")}
              </p>
              <Badge
                variant={
                  coach.verificationStatus === "VERIFIED"
                    ? "default"
                    : "secondary"
                }
              >
                {coach.verificationStatus === "VERIFIED" &&
                  t("coach.discovery.certVerified")}
                {coach.verificationStatus === "PENDING" &&
                  t("coach.discovery.certPending")}
                {coach.verificationStatus === "UNVERIFIED" &&
                  t("coach.discovery.certUnverified")}
                {coach.verificationStatus === "REJECTED" &&
                  t("coach.discovery.certRejected")}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            {t("coach.discovery.paymentInfo")}
          </p>
          <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
            <p className="text-sm">
              <span className="text-muted-foreground">
                {t("coach.discovery.paymentBank")}
              </span>
              <span className="font-medium">{coach.paymentBankName}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">
                {t("coach.discovery.paymentAccountNumber")}
              </span>
              <span className="font-medium">{coach.paymentAccountNumber}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">
                {t("coach.discovery.paymentAccountName")}
              </span>
              <span className="font-medium">{coach.paymentAccountName}</span>
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            {t("coach.discovery.certificates")}
          </p>
          {coach.certifications.length === 0 ? (
            <p className="text-sm">{t("coach.discovery.noCertificates")}</p>
          ) : (
            <div className="space-y-2">
              {coach.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{cert.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cert.issuingOrganization}
                    </p>
                  </div>
                  <Badge
                    className={getCertBadgeVariant(cert.verificationStatus)}
                  >
                    {cert.verificationStatus === "VERIFIED"
                      ? t("coach.discovery.certVerified")
                      : cert.verificationStatus === "PENDING"
                        ? t("coach.discovery.certPending")
                        : cert.verificationStatus === "UNVERIFIED"
                          ? t("coach.discovery.certUnverified")
                          : cert.verificationStatus === "REJECTED"
                            ? t("coach.discovery.certRejected")
                            : cert.verificationStatus}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function StatsTab({ coach }: { coach: CoachProfile }) {
  const { t } = useTranslation("common")
  const { data: reviewsData } = useCoachReviews(coach.id)
  const { data: classes } = useCoachOpenClasses(coach.id)
  const totalReviews = reviewsData?.reviewCount ?? coach.reviewCount
  const avgRating = reviewsData?.averageRating ?? coach.averageRating
  const totalClasses = classes?.length ?? 0
  const totalEnrolled =
    classes?.reduce((sum, cls) => sum + cls.enrolledCount, 0) ?? 0
  const totalCapacity =
    classes?.reduce((sum, cls) => sum + cls.capacity, 0) ?? 0

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Star className="size-4 text-yellow-500" />
            {t("coach.discovery.reviewsSectionTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground">
            {totalReviews} {t("coach.discovery.statsReviews")}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="size-4 text-blue-500" />
            {t("coach.discovery.classesTab")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalClasses}</p>
          <p className="text-sm text-muted-foreground">
            {totalClasses} {t("coach.discovery.statsOpenClasses")}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4 text-green-500" />
            {t("coach.discovery.statsEnrolled")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {totalEnrolled}/{totalCapacity}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("coach.discovery.statsEnrolled")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export type DiscoveryTabValue =
  | "overview"
  | "schedule"
  | "reviews"
  | "classes"
  | "info"
  | "stats"

const TABS = (t: (key: string) => string) => [
  {
    value: "overview" as const,
    label: t("coach.discovery.tabOverview"),
    icon: <Info className="size-4" />,
  },
  {
    value: "schedule" as const,
    label: t("coach.discovery.tabSchedule"),
    icon: <Calendar className="size-4" />,
  },
  {
    value: "reviews" as const,
    label: t("coach.discovery.tabReviews"),
    icon: <Star className="size-4" />,
  },
  {
    value: "classes" as const,
    label: t("coach.discovery.tabClasses"),
    icon: <BookOpen className="size-4" />,
  },
  {
    value: "stats" as const,
    label: t("coach.discovery.tabStats"),
    icon: <BarChart3 className="size-4" />,
  },
  {
    value: "info" as const,
    label: t("coach.discovery.tabInfo"),
    icon: <Award className="size-4" />,
  },
]

function DiscoveryLoadingState() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  )
}

function DiscoveryErrorState({
  onBack,
  t,
}: {
  onBack: () => void
  t: (key: string) => string
}) {
  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="flex items-center gap-1"
      >
        <ArrowLeft className="size-4" />
        {t("coach.discovery.backToList")}
      </Button>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-xl font-medium text-muted-foreground">
            {t("coach.discovery.loadError")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("coach.discovery.loadErrorHint")}
          </p>
          <Button variant="outline" className="mt-4" onClick={onBack}>
            {t("coach.discovery.backToList")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function CoachDiscoveryDetailInner({
  coachId,
  onBack,
  defaultTab,
}: {
  coachId: string
  onBack: () => void
  defaultTab: DiscoveryTabValue
}) {
  const { t, i18n } = useTranslation("common")
  const locale = getLocaleCode(i18n.language)
  const router = useRouter()
  const searchParams = useSearchParams()
  const session = useSession()
  const isLearner = !!session?.user

  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [bookingDuration, setBookingDuration] = useState(60)
  const [bookingNote, setBookingNote] = useState("")
  const [bookingLocationMode, setBookingLocationMode] = useState<
    "free-text" | "court"
  >("free-text")
  const [bookingCourtBookingId, setBookingCourtBookingId] = useState("")
  const [bookingCourtId, setBookingCourtId] = useState("")
  const [bookingLocationDescription, setBookingLocationDescription] =
    useState("")

  const createBooking = useCreateBooking()

  const { data: coach, isLoading, error } = useCoachPublicProfile(coachId)

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", value)
      router.replace(`/coaches?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const handleBookingSelectionChange = useCallback(
    (booking: CourtBookingSelection | null) => {
      if (!booking) {
        setBookingDate("")
        setBookingTime("")
        setBookingDuration(60)
        return
      }

      setBookingDate(getBookingDateKey(booking.date) ?? "")
      const firstCourtSlot = booking.bookingItems[0]
      if (!firstCourtSlot) return

      setBookingTime(firstCourtSlot.startTime)
      setBookingDuration(getCourtSlotDurationMinutes(firstCourtSlot))
    },
    [setBookingDate, setBookingDuration, setBookingTime]
  )

  const handleBookingCourtSlotChange = useCallback(
    ({
      booking,
      court,
    }: {
      booking: CourtBookingSelection
      court: CourtBookingCourtSelection
    }) => {
      setBookingDate((current) => {
        const nextDate = formatBookingInputDate(booking.date)
        return current === nextDate ? current : nextDate
      })
      setBookingTime((current) =>
        current === court.startTime ? current : court.startTime
      )
      const durationMinutes = getCourtSlotDurationMinutes(court)
      if (durationMinutes > 0) {
        setBookingDuration((current) =>
          current === durationMinutes ? current : durationMinutes
        )
      }
    },
    [setBookingDate, setBookingDuration, setBookingTime]
  )

  const handleCreateBooking = async () => {
    if (!bookingDate || !bookingTime) {
      toast.error(t("coach.discovery.bookingDateRequired"))
      return
    }

    if (bookingLocationMode === "court" && !bookingCourtBookingId) {
      toast.error(t("coach.courtBookingSelector.bookingRequired"))
      return
    }

    if (bookingLocationMode === "court" && !bookingCourtId) {
      toast.error(t("coach.courtBookingSelector.courtRequired"))
      return
    }

    if (
      bookingLocationMode === "free-text" &&
      !bookingLocationDescription.trim()
    ) {
      toast.error(t("coach.courtBookingSelector.manualLocationRequired"))
      return
    }

    const sessionAt = new Date(`${bookingDate}T${bookingTime}:00`).toISOString()
    try {
      const dto =
        bookingLocationMode === "court"
          ? {
              sessionAt,
              durationMinutes: bookingDuration,
              learnerNote: bookingNote || undefined,
              courtBookingId: bookingCourtBookingId || undefined,
              courtId: bookingCourtId || undefined,
            }
          : {
              sessionAt,
              durationMinutes: bookingDuration,
              learnerNote: bookingNote || undefined,
              locationDescription: bookingLocationDescription || undefined,
            }

      await createBooking.mutateAsync({
        coachId,
        dto,
      })
      toast.success(t("coach.discovery.bookingSuccess"))
      setBookingOpen(false)
      setBookingDate("")
      setBookingTime("")
      setBookingNote("")
      setBookingLocationMode("free-text")
      setBookingCourtBookingId("")
      setBookingCourtId("")
      setBookingLocationDescription("")
    } catch {
      toast.error(t("coach.discovery.bookingError"))
    }
  }

  if (isLoading) {
    return <DiscoveryLoadingState />
  }

  if (error || !coach) {
    return <DiscoveryErrorState onBack={onBack} t={t} />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 items-start gap-6">
              <Avatar size="lg" className="size-24">
                <AvatarImage src={coach.avatarUrl} alt={coach.displayName} />
                <AvatarFallback>
                  {coach.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold">{coach.displayName}</h1>
                  <Badge variant="secondary">
                    {getLevelLabel(t, coach.level)}
                  </Badge>
                  {coach.verificationStatus === "VERIFIED" && (
                    <BadgeCheck className="size-5 text-blue-500" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  <span>{coach.locationCity}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <StarRating rating={coach.averageRating} />
                    <span className="ml-1 font-medium">
                      {coach.averageRating.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      {t("coach.discovery.reviewCount", {
                        count: coach.reviewCount,
                      })}
                    </span>
                  </div>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-medium text-primary">
                    {formatCurrencyValue(coach.hourlyRateVnd, "VND", locale)}
                    {t("coach.discovery.perHour")}
                  </span>
                </div>
                {isLearner && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button onClick={() => setBookingOpen(true)}>
                      <Plus className="size-4" />
                      {t("coach.discovery.bookButton")}
                    </Button>
                    <LearnerCoachRecommendationDialog
                      coachId={coachId}
                      coachName={coach.displayName}
                    />
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2 self-start"
              onClick={onBack}
            >
              <ArrowLeft className="size-4" />
              {t("coach.discovery.backToList")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("coach.discovery.bookingDialogTitle", {
                name: coach.displayName,
              })}
            </DialogTitle>
            <DialogDescription>
              {t("coach.discovery.bookingDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <CourtBookingLocationFields
              mode={bookingLocationMode}
              onModeChange={setBookingLocationMode}
              courtBookingId={bookingCourtBookingId}
              onCourtBookingIdChange={setBookingCourtBookingId}
              courtId={bookingCourtId}
              onCourtIdChange={setBookingCourtId}
              locationDescription={bookingLocationDescription}
              onLocationDescriptionChange={setBookingLocationDescription}
              onBookingSelectionChange={handleBookingSelectionChange}
              onSelectedCourtSlotChange={handleBookingCourtSlotChange}
              disabled={createBooking.isPending}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("coach.discovery.bookingDateLabel")}</Label>
                <Input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("coach.discovery.bookingTimeLabel")}</Label>
                <Input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("coach.discovery.bookingDurationLabel")}</Label>
              <Input
                type="number"
                value={bookingDuration}
                onChange={(e) => setBookingDuration(Number(e.target.value))}
                min={30}
                step={15}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("coach.discovery.bookingNoteLabel")}</Label>
              <Input
                placeholder={t("coach.discovery.bookingNotePlaceholder")}
                value={bookingNote}
                onChange={(e) => setBookingNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>
              {t("coach.discovery.bookingCancelButton")}
            </Button>
            <Button
              onClick={handleCreateBooking}
              disabled={
                createBooking.isPending ||
                !bookingDate ||
                !bookingTime ||
                (bookingLocationMode === "court"
                  ? !bookingCourtBookingId || !bookingCourtId
                  : !bookingLocationDescription.trim())
              }
            >
              {createBooking.isPending
                ? t("coach.discovery.bookingSubmitting")
                : t("coach.discovery.bookingSubmitButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={defaultTab}
        onValueChange={handleTabChange}
        className="w-full gap-6"
      >
        <TabsList
          variant="line"
          className="w-full min-w-0 flex-wrap justify-start gap-1 overflow-x-auto pb-1"
        >
          {TABS(t).map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="sm:flex-none"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6 w-full min-w-0">
          <OverviewTab coach={coach} />
        </TabsContent>
        <TabsContent value="schedule" className="mt-6 w-full min-w-0">
          <ScheduleTab coachId={coachId} />
        </TabsContent>
        <TabsContent value="reviews" className="mt-6 w-full min-w-0">
          <ReviewsTab coachId={coachId} />
        </TabsContent>
        <TabsContent value="classes" className="mt-6 w-full min-w-0">
          <ClassesTab coachId={coachId} />
        </TabsContent>
        <TabsContent value="stats" className="mt-6 w-full min-w-0">
          <StatsTab coach={coach} />
        </TabsContent>
        <TabsContent value="info" className="mt-6 w-full min-w-0">
          <InfoTab coach={coach} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function CoachDiscoveryDetail({
  coachId,
  onBack,
  defaultTab = "overview",
}: {
  coachId: string
  onBack: () => void
  defaultTab?: DiscoveryTabValue
}) {
  return (
    <Suspense fallback={null}>
      <CoachDiscoveryDetailInner
        coachId={coachId}
        onBack={onBack}
        defaultTab={defaultTab}
      />
    </Suspense>
  )
}
