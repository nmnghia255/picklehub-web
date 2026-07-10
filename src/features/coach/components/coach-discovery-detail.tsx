"use client"

import {
  ArrowLeft,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
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
import { cn } from "@/lib/utils"

const LEVEL_LABELS: Record<CoachLevel, string> = {
  Beginner: "Cơ bản",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
  Pro: "Chuyên nghiệp",
}

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

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Vừa xong"
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks} tuần trước`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} tháng trước`
  const years = Math.floor(days / 365)
  return `${years} năm trước`
}

function formatScheduleDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  })
}

function formatScheduleTime(value: string) {
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
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
              Giới thiệu
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
            Thông tin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Kinh nghiệm</p>
              <p className="flex items-center gap-1 font-medium">
                <Clock className="size-4" />
                {coach.yearsExperience} năm
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Chuyên môn</p>
              <div className="flex flex-wrap gap-1">
                {coach.specialties.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Ngôn ngữ</p>
              <p className="flex items-center gap-1 font-medium">
                <Globe className="size-4" />
                {coach.languages.join(", ")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Giá</p>
              <p className="flex items-center gap-1 font-medium">
                <Clock className="size-4" />
                {formatCurrency(coach.hourlyRateVnd)} / giờ
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
              Chứng chỉ
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
                      Cấp ngày:{" "}
                      {new Date(cert.issuedAt).toLocaleDateString("vi-VN")}
                      {cert.expiresAt &&
                        ` - Hết hạn: ${new Date(cert.expiresAt).toLocaleDateString("vi-VN")}`}
                    </p>
                  </div>
                  <Badge
                    className={getCertBadgeVariant(cert.verificationStatus)}
                  >
                    {cert.verificationStatus === "VERIFIED" && "Đã xác thực"}
                    {cert.verificationStatus === "UNVERIFIED" &&
                      "Chưa xác thực"}
                    {cert.verificationStatus === "PENDING" && "Đang chờ"}
                    {cert.verificationStatus === "REJECTED" && "Từ chối"}
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
            Đánh giá
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
                {coach.reviewCount} đánh giá
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
              Đánh giá từ học viên
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
                      {formatRelativeTime(review.createdAt)}
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
            Lớp học có sẵn
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
              <p className="text-muted-foreground">Hiện chưa có lớp học nào</p>
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
                          {LEVEL_LABELS[cls.level]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {formatCurrency(cls.priceVnd)}
                        </span>
                        <span className="text-muted-foreground">
                          {cls.enrolledCount}/{cls.capacity} học viên
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
                                "vi-VN",
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

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "upcoming", label: "Sắp tới" },
  { value: "live", label: "Đang diễn ra" },
  { value: "past", label: "Đã kết thúc" },
  { value: "pending", label: "Chờ xác nhận" },
]

const KIND_OPTIONS_SCHEDULE = [
  { value: "all", label: "Tất cả loại" },
  { value: "class", label: "Lớp học" },
  { value: "booking", label: "Đặt lịch" },
]

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Sắp tới",
  live: "Đang diễn ra",
  past: "Đã kết thúc",
  pending: "Chờ xác nhận",
}

function ScheduleItemCard({
  item,
  onClick,
}: {
  item: LearnerScheduleItem
  onClick: (item: LearnerScheduleItem) => void
}) {
  const coachName = item.coachProfile?.displayName ?? "Không xác định"
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
              {item.kind === "class" ? "Lớp học" : "Đặt lịch"}
            </Badge>
            <p className="truncate text-sm font-medium">{item.title}</p>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatScheduleTime(item.startsAt)} -{" "}
              {formatScheduleTime(item.endsAt)}
            </span>
            <span>({item.durationMinutes} phút)</span>
            {coachName !== "Không xác định" && (
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
              Chủ đề: {item.topic}
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
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {item.kind === "class" ? "Lớp học" : "Đặt lịch"}
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
            {formatScheduleDate(item.startsAt)}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {formatScheduleTime(item.startsAt)} -{" "}
            {formatScheduleTime(item.endsAt)}
          </div>
          <p className="text-sm text-muted-foreground">
            Thời lượng: {item.durationMinutes} phút
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
              Chủ đề: {item.topic}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ScheduleTab({ coachId }: { coachId: string }) {
  const session = useSession()
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
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
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
  }, [data?.data, search, kind, state, fromDate, toDate])

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

  const weekDays = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ]

  const weeks: Date[][] = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  const viewModeOptions = [
    { value: "calendar" as const, label: "Lịch", icon: Calendar },
    { value: "agenda" as const, label: "Danh sách", icon: List },
    { value: "list" as const, label: "Chi tiết", icon: Filter },
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
                placeholder="Tìm kiếm..."
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
              <span className="text-sm text-muted-foreground">Từ:</span>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-9 w-34"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Đến:</span>
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
          <p className="text-lg font-medium">Không có kết quả phù hợp</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
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
                                  {formatScheduleTime(item.startsAt)} -{" "}
                                  {formatScheduleTime(item.endsAt)}
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
          )}

          {/* ── Agenda view ── */}
          {viewMode === "agenda" && (
            <div className="space-y-6">
              {(() => {
                const grouped = new Map<string, LearnerScheduleItem[]>()
                for (const item of filteredItems) {
                  const key = item.startsAt.slice(0, 10)
                  if (!grouped.has(key)) grouped.set(key, [])
                  grouped.get(key)!.push(item)
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
                            {formatScheduleDate(dateKey)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dayItems.length} buổi
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
      toast.error("Vui lòng chọn số sao từ 1 đến 5")
      return
    }
    try {
      await createReview.mutateAsync({
        coachId,
        dto: { rating: reviewRating, comment: reviewComment || undefined },
      })
      toast.success("Đã gửi đánh giá")
      setReviewOpen(false)
      setReviewComment("")
    } catch {
      toast.error("Gửi đánh giá thất bại")
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
      toast.error("Vui lòng chọn số sao từ 1 đến 5")
      return
    }
    try {
      await updateReview.mutateAsync({
        coachId,
        reviewId: editingReviewId,
        dto: { rating: editRating, comment: editComment || undefined },
      })
      toast.success("Đã cập nhật đánh giá")
      setEditingReviewId(null)
    } catch {
      toast.error("Cập nhật thất bại")
    }
  }

  const handleDeleteReview = async () => {
    if (!deleteConfirmId) return
    try {
      await deleteReview.mutateAsync({ coachId, reviewId: deleteConfirmId })
      toast.success("Đã xóa đánh giá")
      setDeleteConfirmId(null)
    } catch {
      toast.error("Xóa đánh giá thất bại")
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
          <p className="text-destructive">
            Không thể tải đánh giá. Vui lòng thử lại sau.
          </p>
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
              Viết đánh giá
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Viết đánh giá</DialogTitle>
              <DialogDescription>
                Chia sẻ trải nghiệm của bạn với huấn luyện viên này.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Đánh giá (1-5 sao)</Label>
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
                <Label>Nhận xét</Label>
                <textarea
                  className="w-full rounded-md border p-2 text-sm"
                  rows={4}
                  placeholder="Chia sẻ cảm nhận của bạn..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={createReview.isPending}
              >
                {createReview.isPending ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="mb-2 size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Chưa có đánh giá nào</p>
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
                          {updateReview.isPending ? "Đang lưu..." : "Lưu"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingReviewId(null)}
                        >
                          Hủy
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
                            title="Sửa đánh giá"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(review.reviewId)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Xóa đánh giá"
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
                      {formatRelativeTime(review.createdAt)}
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
            <DialogTitle>Xác nhận xóa đánh giá</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReview}
              disabled={deleteReview.isPending}
            >
              {deleteReview.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ClassesTab({ coachId }: { coachId: string }) {
  const session = useSession()
  const isLearner = !!session?.user
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const enrollMutation = useEnrollInClass()

  const { data: classes, isLoading, error } = useCoachOpenClasses(coachId)

  const handleEnroll = async (classId: string) => {
    setEnrollingId(classId)
    try {
      await enrollMutation.mutateAsync(classId)
      toast.success("Đăng ký lớp học thành công")
    } catch {
      toast.error("Đăng ký lớp thất bại")
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
            Không thể tải lớp học. Vui lòng thử lại sau.
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
            Huấn luyện viên chưa có lớp học nào
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
                  <Badge variant="outline">{LEVEL_LABELS[cls.level]}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(cls.priceVnd)}
                  </span>
                  <span className="text-muted-foreground">
                    {cls.enrolledCount}/{cls.capacity} học viên
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
                          "vi-VN",
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
                    {enrollingId === cls.id ? "Đang xử lý..." : "Đăng ký"}
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
  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Kinh nghiệm</p>
              <p className="font-medium">{coach.yearsExperience} năm</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Giá theo giờ</p>
              <p className="font-medium">
                {formatCurrency(coach.hourlyRateVnd)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Thành phố</p>
              <p className="font-medium">{coach.locationCity}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Chuyên môn</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {coach.specialties.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngôn ngữ</p>
              <p className="font-medium">{coach.languages.join(", ")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Trạng thái xác thực
              </p>
              <Badge
                variant={
                  coach.verificationStatus === "VERIFIED"
                    ? "default"
                    : "secondary"
                }
              >
                {coach.verificationStatus === "VERIFIED" && "Đã xác thực"}
                {coach.verificationStatus === "PENDING" && "Chờ xác thực"}
                {coach.verificationStatus === "UNVERIFIED" && "Chưa xác thực"}
                {coach.verificationStatus === "REJECTED" && "Từ chối"}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            Thông tin thanh toán
          </p>
          <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
            <p className="text-sm">
              <span className="text-muted-foreground">Ngân hàng: </span>
              <span className="font-medium">{coach.paymentBankName}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Số tài khoản: </span>
              <span className="font-medium">{coach.paymentAccountNumber}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Chủ tài khoản: </span>
              <span className="font-medium">{coach.paymentAccountName}</span>
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-sm text-muted-foreground">Các chứng chỉ</p>
          {coach.certifications.length === 0 ? (
            <p className="text-sm">Chưa có chứng chỉ nào</p>
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
                      ? "Đã xác thực"
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
            Đánh giá
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground">
            {totalReviews} lượt đánh giá
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="size-4 text-blue-500" />
            Lớp học
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalClasses}</p>
          <p className="text-sm text-muted-foreground">lớp đang mở</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4 text-green-500" />
            Học viên
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {totalEnrolled}/{totalCapacity}
          </p>
          <p className="text-sm text-muted-foreground">đã đăng ký</p>
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

const TABS: {
  value: DiscoveryTabValue
  label: string
  icon: React.ReactNode
}[] = [
  { value: "overview", label: "Tổng quan", icon: <Info className="size-4" /> },
  { value: "schedule", label: "Lịch", icon: <Calendar className="size-4" /> },
  { value: "reviews", label: "Đánh giá", icon: <Star className="size-4" /> },
  {
    value: "classes",
    label: "Khóa học",
    icon: <BookOpen className="size-4" />,
  },
  { value: "stats", label: "Thống kê", icon: <BarChart3 className="size-4" /> },
  { value: "info", label: "Thông tin", icon: <Award className="size-4" /> },
]

function CoachDiscoveryDetailInner({
  coachId,
  onBack,
  defaultTab,
}: {
  coachId: string
  onBack: () => void
  defaultTab: DiscoveryTabValue
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const session = useSession()
  const isLearner = !!session?.user

  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [bookingDuration, setBookingDuration] = useState(60)
  const [bookingNote, setBookingNote] = useState("")

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

  const handleCreateBooking = async () => {
    if (!bookingDate || !bookingTime) {
      toast.error("Vui lòng chọn ngày và giờ")
      return
    }
    const sessionAt = new Date(`${bookingDate}T${bookingTime}:00`).toISOString()
    try {
      await createBooking.mutateAsync({
        coachId,
        dto: {
          sessionAt,
          durationMinutes: bookingDuration,
          learnerNote: bookingNote || undefined,
        },
      })
      toast.success("Yêu cầu đặt lịch đã được gửi")
      setBookingOpen(false)
      setBookingDate("")
      setBookingTime("")
      setBookingNote("")
    } catch {
      toast.error("Đặt lịch thất bại")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !coach) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="size-4" />
          Quay lại danh sách
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-xl font-medium text-muted-foreground">
              Không thể tải thông tin huấn luyện viên
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Vui lòng thử lại hoặc quay lại danh sách.
            </p>
            <Button variant="outline" className="mt-4" onClick={onBack}>
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="-ml-2 flex items-center gap-1"
      >
        <ArrowLeft className="size-4" />
        Quay lại danh sách
      </Button>

      <Card>
        <CardContent className="flex items-start gap-6 pt-6">
          <Avatar size="lg" className="size-24">
            <AvatarImage src={coach.avatarUrl} alt={coach.displayName} />
            <AvatarFallback>
              {coach.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{coach.displayName}</h1>
              <Badge variant="secondary">{LEVEL_LABELS[coach.level]}</Badge>
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
                  ({coach.reviewCount} đánh giá)
                </span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="font-medium text-primary">
                {formatCurrency(coach.hourlyRateVnd)}/giờ
              </span>
            </div>
            {isLearner && (
              <div className="mt-2 flex gap-2">
                <Button onClick={() => setBookingOpen(true)}>
                  <Plus className="size-4" />
                  Đặt lịch riêng
                </Button>
                <LearnerCoachRecommendationDialog
                  coachId={coachId}
                  coachName={coach.displayName}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đặt lịch với {coach.displayName}</DialogTitle>
            <DialogDescription>
              Chọn thời gian bạn muốn học. HLV sẽ xác nhận sau.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày</Label>
                <Input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Giờ</Label>
                <Input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Thời lượng (phút)</Label>
              <Input
                type="number"
                value={bookingDuration}
                onChange={(e) => setBookingDuration(Number(e.target.value))}
                min={30}
                step={15}
              />
            </div>
            <div className="space-y-2">
              <Label>Ghi chú (không bắt buộc)</Label>
              <Input
                placeholder="Ví dụ: Tôi muốn học kỹ thuật serve"
                value={bookingNote}
                onChange={(e) => setBookingNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleCreateBooking}
              disabled={createBooking.isPending}
            >
              {createBooking.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
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
          {TABS.map((tab) => (
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
