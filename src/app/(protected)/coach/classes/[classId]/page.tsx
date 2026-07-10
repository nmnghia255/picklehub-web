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
import dayjs from "dayjs"
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Plus,
  Send,
  Trash2,
  Users,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { CalendarNavigation } from "@/components/calendar-navigation"
import { PageContainer } from "@/components/page-container"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "@/features/auth/hooks/use-session"
import {
  useAddScheduleSlot,
  useCancelClass,
  useClassEnrollments,
  useClassScheduleEntries,
  useMyClassDetail,
  usePublishClass,
  useRejectEnrollmentPayment,
  useRemoveScheduleSlot,
  useSettleEnrollmentPayment,
  useUpdateClass,
} from "@/features/coach/hooks/use-coach-queries"
import type {
  ClassScheduleEntry,
  ClassStatus,
  CoachLevel,
  EnrollmentStatus,
  PaymentStatus,
} from "@/features/coach/types/coach"

const statusLabel: Record<ClassStatus, string> = {
  DRAFT: "Nháp",
  OPEN: "Đang mở",
  FULL: "Đã đầy",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã kết thúc",
  CANCELLED: "Đã hủy",
}

const statusVariant: Record<
  ClassStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  OPEN: "default",
  FULL: "secondary",
  ONGOING: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
}

const levelOptions: { value: CoachLevel; label: string }[] = [
  { value: "Beginner", label: "Cơ bản" },
  { value: "Intermediate", label: "Trung cấp" },
  { value: "Advanced", label: "Nâng cao" },
  { value: "Pro", label: "Chuyên nghiệp" },
]

const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING_PROOF: "Chờ bằng chứng",
  PENDING_REVIEW: "Chờ xác nhận",
  SETTLED: "Đã thanh toán",
  REJECTED: "Từ chối",
}

const paymentStatusVariant: Record<
  PaymentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING_PROOF: "outline",
  PENDING_REVIEW: "secondary",
  SETTLED: "default",
  REJECTED: "destructive",
}

const enrollmentStatusLabel: Record<EnrollmentStatus, string> = {
  ACTIVE: "Đang học",
  CANCELLED: "Đã hủy",
  COMPLETED: "Đã hoàn thành",
}

const durationOptions = [30, 60, 90, 120]

function LoadingSkeleton() {
  return (
    <PageContainer variant="wide" className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </PageContainer>
  )
}

export default function CoachClassDetailPage() {
  const session = useSession()
  const params = useParams()
  const classId = params.classId as string

  const {
    data: classData,
    isLoading,
    isError,
  } = useMyClassDetail(classId, { enabled: !!session?.user })
  const {
    data: scheduleData,
    isLoading: scheduleLoading,
    isError: scheduleIsError,
    error: scheduleError,
  } = useClassScheduleEntries(classId, undefined, { enabled: !!session?.user })
  const { data: enrollmentData, isLoading: enrollmentLoading } =
    useClassEnrollments(classId, { enabled: !!session?.user })

  const updateClass = useUpdateClass()
  const publishClass = usePublishClass()
  const cancelClass = useCancelClass()
  const addScheduleSlot = useAddScheduleSlot()
  const removeScheduleSlot = useRemoveScheduleSlot()
  const settleEnrollment = useSettleEnrollmentPayment()
  const rejectEnrollment = useRejectEnrollmentPayment()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [level, setLevel] = useState<CoachLevel>("Beginner")
  const [capacity, setCapacity] = useState(0)
  const [priceVnd, setPriceVnd] = useState(0)
  const [locationDescription, setLocationDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [showAddSchedule, setShowAddSchedule] = useState(false)
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null)
  const [scheduleTime, setScheduleTime] = useState("09:00")
  const [scheduleDuration, setScheduleDuration] = useState(60)
  const [scheduleTopic, setScheduleTopic] = useState("")
  const [scheduleNote, setScheduleNote] = useState("")
  const [scheduleCalendarMonth, setScheduleCalendarMonth] = useState(() =>
    startOfMonth(new Date())
  )

  const timeSlots = useMemo(() => {
    const slots: string[] = []
    for (let h = 6; h <= 22; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`)
    }
    return slots
  }, [])

  const scheduleGridDays = useMemo(() => {
    const monthStart = startOfMonth(scheduleCalendarMonth)
    const monthEnd = endOfMonth(scheduleCalendarMonth)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [scheduleCalendarMonth])

  const scheduleWeekDays = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ]

  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null)

  type ScheduleViewMode = "calendar" | "timeline" | "list"
  const [scheduleViewMode, setScheduleViewMode] =
    useState<ScheduleViewMode>("calendar")
  const [scheduleCurrentDate, setScheduleCurrentDate] = useState(() =>
    startOfMonth(new Date())
  )
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState("")
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState("all")
  const [scheduleSortOrder, setScheduleSortOrder] = useState("asc")
  const [scheduleFromDate, setScheduleFromDate] = useState<string | undefined>(
    undefined
  )
  const [scheduleToDate, setScheduleToDate] = useState<string | undefined>(
    undefined
  )
  const [schedulePage, setSchedulePage] = useState(1)

  const [settleEnrollmentId, setSettleEnrollmentId] = useState<string | null>(
    null
  )
  const [rejectEnrollmentId, setRejectEnrollmentId] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (classData) {
      // Normalize: API may return null for string/number fields.
      // React throws "value prop on input should not be null" and
      // "changing controlled input to uncontrolled" when state flips
      // from ""/0 → null → "".
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(classData.title ?? "")
      setDescription(classData.description ?? "")
      setLevel(classData.level ?? "Beginner")
      setCapacity(classData.capacity ?? 0)
      setPriceVnd(classData.priceVnd ?? 0)
      setLocationDescription(classData.locationDescription ?? "")
      setStartDate(
        classData.startDate
          ? dayjs(classData.startDate).format("YYYY-MM-DD")
          : ""
      )
      setEndDate(
        classData.endDate ? dayjs(classData.endDate).format("YYYY-MM-DD") : ""
      )
    }
  }, [classData])

  const schedules = scheduleData ?? []
  const enrollments = enrollmentData ?? []

  const DEFAULT_LIMIT = 10

  function getScheduleEntryStatus(entry: ClassScheduleEntry) {
    const now = new Date()
    const start = new Date(entry.scheduledAt)
    const end = new Date(start.getTime() + entry.durationMinutes * 60 * 1000)
    if (end < now) return "past"
    if (start > now) return "upcoming"
    return "live"
  }

  const scheduleStatusLabels: Record<string, string> = {
    upcoming: "Sắp diễn ra",
    live: "Đang diễn ra",
    past: "Đã kết thúc",
  }

  const viewGridDays = useMemo(() => {
    const monthStart = startOfMonth(scheduleCurrentDate)
    const monthEnd = endOfMonth(scheduleCurrentDate)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [scheduleCurrentDate])

  const monthScheduleMap = useMemo(() => {
    const map = new Map<string, ClassScheduleEntry[]>()
    for (const entry of schedules) {
      const key = format(new Date(entry.scheduledAt), "yyyy-MM-dd")
      const existing = map.get(key) ?? []
      existing.push(entry)
      map.set(key, existing)
    }
    return map
  }, [schedules])

  const groupedByDate = useMemo(() => {
    const map = new Map<string, ClassScheduleEntry[]>()
    const sorted = [...schedules].sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    )
    for (const entry of sorted) {
      const key = format(new Date(entry.scheduledAt), "yyyy-MM-dd")
      const existing = map.get(key) ?? []
      existing.push(entry)
      map.set(key, existing)
    }
    return map
  }, [schedules])

  const sortedDates = useMemo(
    () => Array.from(groupedByDate.keys()).sort(),
    [groupedByDate]
  )

  const filteredListItems = useMemo(() => {
    const lowered = scheduleSearchTerm.trim().toLowerCase()
    return schedules
      .filter((entry) => {
        if (
          scheduleStatusFilter !== "all" &&
          getScheduleEntryStatus(entry) !== scheduleStatusFilter
        )
          return false
        if (
          lowered &&
          !entry.topic?.toLowerCase().includes(lowered) &&
          !entry.note?.toLowerCase().includes(lowered)
        )
          return false
        if (
          scheduleFromDate &&
          new Date(entry.scheduledAt) < new Date(scheduleFromDate)
        )
          return false
        if (scheduleToDate) {
          const toEnd = new Date(scheduleToDate)
          toEnd.setHours(23, 59, 59, 999)
          if (new Date(entry.scheduledAt) > toEnd) return false
        }
        return true
      })
      .sort((a, b) => {
        const aTime = new Date(a.scheduledAt).getTime()
        const bTime = new Date(b.scheduledAt).getTime()
        return scheduleSortOrder === "desc" ? bTime - aTime : aTime - bTime
      })
  }, [
    schedules,
    scheduleSearchTerm,
    scheduleStatusFilter,
    scheduleSortOrder,
    scheduleFromDate,
    scheduleToDate,
  ])

  const scheduleTotalPages = Math.max(
    1,
    Math.ceil(filteredListItems.length / DEFAULT_LIMIT)
  )
  const safeSchedulePage = Math.min(schedulePage, scheduleTotalPages)

  const paginatedListItems = useMemo(() => {
    const startIndex = (safeSchedulePage - 1) * DEFAULT_LIMIT
    return filteredListItems.slice(startIndex, startIndex + DEFAULT_LIMIT)
  }, [filteredListItems, safeSchedulePage])

  if (isLoading) return <LoadingSkeleton />

  if (isError || !classData) {
    return (
      <PageContainer variant="wide" className="py-20 text-center">
        <p className="text-lg text-muted-foreground">Lớp học không tồn tại</p>
      </PageContainer>
    )
  }

  const canEdit = classData.status === "DRAFT" || classData.status === "OPEN"
  const isDraft = classData.status === "DRAFT"
  const isCancellable =
    classData.status !== "COMPLETED" && classData.status !== "CANCELLED"

  const handleUpdate = () => {
    updateClass.mutate(
      {
        classId,
        dto: {
          title,
          description: description || undefined,
          level,
          capacity,
          priceVnd,
          locationDescription: locationDescription || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      },
      {
        onSuccess: () => toast.success("Cập nhật lớp học thành công"),
        onError: (err: Error) =>
          toast.error(err.message || "Cập nhật thất bại"),
      }
    )
  }

  const handlePublish = () => {
    publishClass.mutate(classId, {
      onSuccess: () => toast.success("Đã đăng lớp học"),
      onError: (err: Error) => toast.error(err.message || "Đăng lớp thất bại"),
    })
  }

  const handleCancel = () => {
    cancelClass.mutate(classId, {
      onSuccess: () => toast.success("Đã hủy lớp học"),
      onError: (err: Error) => toast.error(err.message || "Hủy lớp thất bại"),
    })
  }

  const handleAddSchedule = () => {
    if (!scheduleDate || !scheduleTime) return
    const [hours, minutes] = scheduleTime.split(":").map(Number)
    const scheduledAt = new Date(scheduleDate)
    scheduledAt.setHours(hours, minutes, 0, 0)
    addScheduleSlot.mutate(
      {
        classId,
        dto: {
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: scheduleDuration,
          topic: scheduleTopic || undefined,
          note: scheduleNote || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Thêm buổi học thành công")
          setShowAddSchedule(false)
          setScheduleDate(null)
          setScheduleTime("09:00")
          setScheduleDuration(60)
          setScheduleTopic("")
          setScheduleNote("")
          setScheduleCalendarMonth(startOfMonth(new Date()))
        },
        onError: (err: Error) =>
          toast.error(err.message || "Thêm buổi học thất bại"),
      }
    )
  }

  const handleDeleteSchedule = () => {
    if (!deleteScheduleId) return
    removeScheduleSlot.mutate(
      { classId, scheduleId: deleteScheduleId },
      {
        onSuccess: () => {
          toast.success("Xóa buổi học thành công")
          setDeleteScheduleId(null)
        },
        onError: (err: Error) =>
          toast.error(err.message || "Xóa buổi học thất bại"),
      }
    )
  }

  const handleSettleEnrollment = () => {
    if (!settleEnrollmentId) return
    settleEnrollment.mutate(
      { classId, enrollmentId: settleEnrollmentId },
      {
        onSuccess: () => {
          toast.success("Xác nhận thanh toán thành công")
          setSettleEnrollmentId(null)
        },
        onError: (err: Error) =>
          toast.error(err.message || "Xác nhận thất bại"),
      }
    )
  }

  const handleRejectEnrollment = () => {
    if (!rejectEnrollmentId) return
    rejectEnrollment.mutate(
      { classId, enrollmentId: rejectEnrollmentId },
      {
        onSuccess: () => {
          toast.success("Từ chối thanh toán thành công")
          setRejectEnrollmentId(null)
        },
        onError: (err: Error) => toast.error(err.message || "Từ chối thất bại"),
      }
    )
  }

  const handleScheduleViewModeChange = (value: ScheduleViewMode) => {
    setScheduleViewMode(value)
    setScheduleSearchTerm("")
    setScheduleStatusFilter("all")
    setScheduleFromDate(undefined)
    setScheduleToDate(undefined)
    setSchedulePage(1)
  }

  const handleScheduleSearchChange = (value: string) => {
    setScheduleSearchTerm(value)
    setSchedulePage(1)
  }

  const handleScheduleStatusChange = (value: string) => {
    setScheduleStatusFilter(value)
    setSchedulePage(1)
  }

  const handleScheduleSortChange = (value: string) => {
    setScheduleSortOrder(value)
    setSchedulePage(1)
  }

  const handleScheduleFromDateChange = (value: string | undefined) => {
    setScheduleFromDate(value)
    setSchedulePage(1)
  }

  const handleScheduleToDateChange = (value: string | undefined) => {
    setScheduleToDate(value)
    setSchedulePage(1)
  }

  const handleSchedulePrevMonth = () =>
    setScheduleCurrentDate((prev) => subMonths(prev, 1))
  const handleScheduleNextMonth = () =>
    setScheduleCurrentDate((prev) => addMonths(prev, 1))
  const handleScheduleMonthChange = (month: number) =>
    setScheduleCurrentDate((prev) => new Date(prev.getFullYear(), month, 1))
  const handleScheduleYearChange = (year: number) =>
    setScheduleCurrentDate((prev) => new Date(year, prev.getMonth(), 1))
  const handleScheduleToday = () =>
    setScheduleCurrentDate(startOfMonth(new Date()))

  function formatScheduleTime(value: string) {
    return new Date(value).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function formatScheduleDate(value: string) {
    return new Date(value).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function renderCalendarToolbar() {
    return (
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <CalendarNavigation
          currentDate={scheduleCurrentDate}
          onMonthChange={handleScheduleMonthChange}
          onYearChange={handleScheduleYearChange}
          onPrevMonth={handleSchedulePrevMonth}
          onNextMonth={handleScheduleNextMonth}
          onToday={handleScheduleToday}
        />
        <Select
          value={scheduleViewMode}
          onValueChange={handleScheduleViewModeChange}
        >
          <SelectTrigger className="min-w-35 border-border bg-background text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="calendar">Calendar</SelectItem>
            <SelectItem value="timeline">Lịch trình</SelectItem>
            <SelectItem value="list">Danh sách</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  function renderTimelineToolbar() {
    return (
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <CalendarNavigation
          currentDate={scheduleCurrentDate}
          onMonthChange={handleScheduleMonthChange}
          onYearChange={handleScheduleYearChange}
          onPrevMonth={handleSchedulePrevMonth}
          onNextMonth={handleScheduleNextMonth}
          onToday={handleScheduleToday}
        />
        <Select
          value={scheduleViewMode}
          onValueChange={handleScheduleViewModeChange}
        >
          <SelectTrigger className="min-w-35 border-border bg-background text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="calendar">Calendar</SelectItem>
            <SelectItem value="timeline">Lịch trình</SelectItem>
            <SelectItem value="list">Danh sách</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  function renderListToolbar() {
    return (
      <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
          <Input
            value={scheduleSearchTerm}
            onChange={(event) => handleScheduleSearchChange(event.target.value)}
            placeholder="Tìm theo chủ đề, ghi chú..."
            className="w-full max-w-sm bg-background text-foreground"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-sm text-muted-foreground">Trạng thái</Label>
            <Select
              value={scheduleStatusFilter}
              onValueChange={handleScheduleStatusChange}
            >
              <SelectTrigger className="min-w-35 border-border bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="upcoming">Sắp tới</SelectItem>
                <SelectItem value="live">Đang diễn ra</SelectItem>
                <SelectItem value="past">Đã qua</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-sm text-muted-foreground">Sắp xếp</Label>
            <Select
              value={scheduleSortOrder}
              onValueChange={handleScheduleSortChange}
            >
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
              value={scheduleFromDate ?? ""}
              onChange={(event) =>
                handleScheduleFromDateChange(event.target.value || undefined)
              }
              className="w-42.5 bg-background text-foreground"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-sm text-muted-foreground">Đến ngày</Label>
            <Input
              type="date"
              value={scheduleToDate ?? ""}
              onChange={(event) =>
                handleScheduleToDateChange(event.target.value || undefined)
              }
              className="w-42.5 bg-background text-foreground"
            />
          </div>
        </div>
        <Select
          value={scheduleViewMode}
          onValueChange={handleScheduleViewModeChange}
        >
          <SelectTrigger className="min-w-35 border-border bg-background text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="calendar">Calendar</SelectItem>
            <SelectItem value="timeline">Lịch trình</SelectItem>
            <SelectItem value="list">Danh sách</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  function renderCalendarView() {
    return (
      <Card className="rounded-2xl border border-border bg-background shadow-sm">
        <CardContent className="overflow-x-auto p-4">
          <div className="min-w-245 space-y-3">
            <div className="grid grid-cols-7 gap-2">
              {scheduleWeekDays.map((day) => (
                <div
                  key={day}
                  className="rounded-xl bg-muted px-3 py-2 text-center text-sm font-medium text-foreground"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {viewGridDays.map((day) => {
                const key = format(day, "yyyy-MM-dd")
                const dayEntries = monthScheduleMap.get(key) ?? []
                const isCurrentMonth = isSameMonth(day, scheduleCurrentDate)
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
                      {dayEntries.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="rounded-full px-2 py-0 text-[10px]"
                        >
                          {dayEntries.length}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {dayEntries.slice(0, 3).map((entry) => (
                        <div
                          key={entry.id}
                          className="flex w-full flex-col gap-1 rounded-lg border border-border/60 bg-muted/50 px-2 py-1.5 text-[12px]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-semibold text-foreground">
                              {entry.topic || "Buổi học"}
                            </span>
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {formatScheduleTime(entry.scheduledAt)} ·{" "}
                              {entry.durationMinutes}p
                            </span>
                          </div>
                          {entry.note && (
                            <span className="truncate text-[11px] text-muted-foreground">
                              {entry.note}
                            </span>
                          )}
                        </div>
                      ))}
                      {dayEntries.length > 3 && (
                        <p className="pl-1 text-xs text-muted-foreground">
                          +{dayEntries.length - 3} buổi khác
                        </p>
                      )}
                      {dayEntries.length === 0 && (
                        <p className="px-1 py-3 text-center text-xs text-muted-foreground">
                          Trống
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
    )
  }

  function renderTimelineView() {
    return (
      <Card className="rounded-2xl border border-border bg-background shadow-sm">
        <CardContent className="p-4">
          {sortedDates.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Không có buổi học nào trong tháng này.
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((dateKey) => {
                const dayEntries = groupedByDate.get(dateKey) ?? []
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
                        {dayEntries.length} buổi
                      </Badge>
                    </div>
                    <div className="ml-5 space-y-2 border-l-2 border-border pl-4">
                      {dayEntries.map((entry) => (
                        <Card
                          key={entry.id}
                          className="rounded-xl border border-border bg-background shadow-sm"
                        >
                          <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate font-semibold text-foreground">
                                  {entry.topic || "Buổi học"}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="rounded-full text-[10px]"
                                >
                                  {
                                    scheduleStatusLabels[
                                      getScheduleEntryStatus(entry)
                                    ]
                                  }
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatScheduleTime(entry.scheduledAt)} ·{" "}
                                {entry.durationMinutes} phút
                              </p>
                              {entry.note && (
                                <p className="text-xs text-muted-foreground">
                                  {entry.note}
                                </p>
                              )}
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="shrink-0 text-destructive"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Xóa buổi học
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc muốn xóa buổi học ngày{" "}
                                    {formatScheduleDate(entry.scheduledAt)}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Quay lại
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    variant="destructive"
                                    onClick={() => {
                                      setDeleteScheduleId(entry.id)
                                      setTimeout(
                                        () => handleDeleteSchedule(),
                                        0
                                      )
                                    }}
                                    disabled={removeScheduleSlot.isPending}
                                  >
                                    {removeScheduleSlot.isPending
                                      ? "Đang xóa..."
                                      : "Xóa"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  function renderListView() {
    return (
      <Card className="rounded-2xl border border-border bg-background shadow-sm">
        <CardContent className="space-y-3 p-4">
          {paginatedListItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Không tìm thấy buổi học nào.
            </div>
          ) : (
            paginatedListItems.map((entry) => (
              <Card
                key={entry.id}
                className="rounded-2xl border border-border bg-background shadow-sm"
              >
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-foreground">
                        {entry.topic || "Buổi học"}
                      </p>
                      <Badge
                        variant="outline"
                        className="rounded-full text-[10px]"
                      >
                        {scheduleStatusLabels[getScheduleEntryStatus(entry)]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatScheduleDate(entry.scheduledAt)} ·{" "}
                      {formatScheduleTime(entry.scheduledAt)} ·{" "}
                      {entry.durationMinutes} phút
                    </p>
                    {entry.note && (
                      <p className="text-xs text-muted-foreground">
                        {entry.note}
                      </p>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa buổi học</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc muốn xóa buổi học ngày{" "}
                          {formatScheduleDate(entry.scheduledAt)}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Quay lại</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => {
                            setDeleteScheduleId(entry.id)
                            setTimeout(() => handleDeleteSchedule(), 0)
                          }}
                          disabled={removeScheduleSlot.isPending}
                        >
                          {removeScheduleSlot.isPending ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    )
  }

  function renderSchedulePagination() {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Trang {safeSchedulePage}/{scheduleTotalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setSchedulePage((p) => Math.max(1, p - 1))}
            disabled={safeSchedulePage <= 1}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setSchedulePage((p) => Math.min(scheduleTotalPages, p + 1))
            }
            disabled={safeSchedulePage >= scheduleTotalPages}
          >
            Sau
          </Button>
        </div>
      </div>
    )
  }

  return (
    <PageContainer variant="wide" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/coach?tab=classes">← Quay lại</Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {classData.title}
          </h1>
          <Badge variant={statusVariant[classData.status]}>
            {statusLabel[classData.status]}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">
            <BookOpen className="size-4" />
            Thông tin lớp
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <CalendarDays className="size-4" />
            Lịch học
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="size-4" />
            Học viên
          </TabsTrigger>
        </TabsList>

        {/* ============ TAB 1: CLASS INFO ============ */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết lớp học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Tên lớp</Label>
                  <Input
                    id="title"
                    value={title ?? ""}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Cấp độ</Label>
                  <Select
                    value={level ?? undefined}
                    onValueChange={(v) => setLevel(v as CoachLevel)}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Sức chứa</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={capacity ?? ""}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Học phí (VNĐ)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={priceVnd ?? ""}
                    onChange={(e) => setPriceVnd(Number(e.target.value))}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Ngày bắt đầu</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate ?? ""}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Ngày kết thúc</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate ?? ""}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm</Label>
                <Input
                  id="location"
                  value={locationDescription ?? ""}
                  onChange={(e) => setLocationDescription(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Ví dụ: Sân PickleHub Quận 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={description ?? ""}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!canEdit}
                  rows={4}
                />
              </div>
              {canEdit && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleUpdate}
                    disabled={updateClass.isPending}
                  >
                    {updateClass.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            {isDraft && (
              <Button onClick={handlePublish} disabled={publishClass.isPending}>
                <Send className="size-4" />
                {publishClass.isPending ? "Đang đăng..." : "Đăng lớp"}
              </Button>
            )}
            {isCancellable && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="size-4" />
                    Hủy lớp
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận hủy lớp</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc muốn hủy lớp học này? Hành động này không thể
                      hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Quay lại</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={cancelClass.isPending}
                    >
                      {cancelClass.isPending ? "Đang hủy..." : "Xác nhận hủy"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Users className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Đã đăng ký</p>
                  <p className="text-lg font-semibold">
                    {classData.enrolledCount}/{classData.capacity}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <DollarSign className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Học phí</p>
                  <p className="text-lg font-semibold">
                    {classData.priceVnd.toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <MapPin className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Địa điểm</p>
                  <p className="truncate text-lg font-semibold">
                    {classData.locationDescription || "Chưa có"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ TAB 2: SCHEDULE ============ */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lịch các buổi học</h2>
            <Button onClick={() => setShowAddSchedule(true)}>
              <Plus className="size-4" />
              Thêm buổi học
            </Button>
          </div>

          {scheduleViewMode === "calendar" && renderCalendarToolbar()}
          {scheduleViewMode === "timeline" && renderTimelineToolbar()}
          {scheduleViewMode === "list" && renderListToolbar()}

          {scheduleLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : schedules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Chưa có buổi học nào.
              </CardContent>
            </Card>
          ) : (
            <>
              {scheduleViewMode === "calendar" && renderCalendarView()}
              {scheduleViewMode === "timeline" && renderTimelineView()}
              {scheduleViewMode === "list" && renderListView()}
            </>
          )}

          {!scheduleLoading &&
            schedules.length > 0 &&
            scheduleViewMode === "list" &&
            renderSchedulePagination()}

          {/* Add Schedule Dialog - Calendar Grid */}
          <Dialog
            open={showAddSchedule}
            onOpenChange={(open) => {
              setShowAddSchedule(open)
              if (!open) {
                setScheduleDate(null)
                setScheduleTime("09:00")
                setScheduleDuration(60)
                setScheduleTopic("")
                setScheduleNote("")
                setScheduleCalendarMonth(startOfMonth(new Date()))
              }
            }}
          >
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Thêm buổi học</DialogTitle>
                <DialogDescription>
                  Chọn ngày, giờ và điền thông tin buổi học.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-3">
                  <CalendarNavigation
                    currentDate={scheduleCalendarMonth}
                    onMonthChange={(month) =>
                      setScheduleCalendarMonth(
                        (prev) => new Date(prev.getFullYear(), month, 1)
                      )
                    }
                    onYearChange={(year) =>
                      setScheduleCalendarMonth(
                        (prev) => new Date(year, prev.getMonth(), 1)
                      )
                    }
                    onPrevMonth={() =>
                      setScheduleCalendarMonth((prev) => subMonths(prev, 1))
                    }
                    onNextMonth={() =>
                      setScheduleCalendarMonth((prev) => addMonths(prev, 1))
                    }
                    onToday={() =>
                      setScheduleCalendarMonth(startOfMonth(new Date()))
                    }
                  />

                  <div className="rounded-xl border p-3">
                    <div className="grid grid-cols-7 gap-1">
                      {scheduleWeekDays.map((day) => (
                        <div
                          key={day}
                          className="rounded-lg bg-muted px-2 py-1.5 text-center text-xs font-medium text-muted-foreground"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="mt-1 grid grid-cols-7 gap-1">
                      {scheduleGridDays.map((day) => {
                        const key = format(day, "yyyy-MM-dd")
                        const isCurrentMonth = isSameMonth(
                          day,
                          scheduleCalendarMonth
                        )
                        const isSelected = scheduleDate
                          ? isSameDay(day, scheduleDate)
                          : false
                        const isToday = isSameDay(day, new Date())
                        const isPast = day < new Date(new Date().toDateString())

                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={isPast}
                            onClick={() => setScheduleDate(day)}
                            className={`rounded-lg px-2 py-2 text-sm transition ${
                              !isCurrentMonth
                                ? "text-muted-foreground/40"
                                : isPast
                                  ? "cursor-not-allowed text-muted-foreground/30"
                                  : isSelected
                                    ? "bg-primary font-semibold text-primary-foreground"
                                    : isToday
                                      ? "bg-accent font-semibold hover:bg-accent/80"
                                      : "hover:bg-accent/60"
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {scheduleDate && (
                  <div className="space-y-2">
                    <Label>Khung giờ</Label>
                    <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                      {timeSlots.map((slot) => {
                        const isSelected = scheduleTime === slot
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setScheduleTime(slot)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50 hover:bg-accent/40"
                            }`}
                          >
                            {slot}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {scheduleDate && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scheduleDuration">Thời lượng</Label>
                        <Select
                          value={String(scheduleDuration)}
                          onValueChange={(v) => setScheduleDuration(Number(v))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {durationOptions.map((d) => (
                              <SelectItem key={d} value={String(d)}>
                                {d} phút
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduleTopic">Chủ đề</Label>
                        <Input
                          id="scheduleTopic"
                          value={scheduleTopic}
                          onChange={(e) => setScheduleTopic(e.target.value)}
                          placeholder="Kỹ thuật giao bóng"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduleNote">Ghi chú</Label>
                      <Textarea
                        id="scheduleNote"
                        value={scheduleNote}
                        onChange={(e) => setScheduleNote(e.target.value)}
                        rows={2}
                        placeholder="Ghi chú thêm (không bắt buộc)"
                      />
                    </div>
                  </div>
                )}

                {!scheduleDate && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Vui lòng chọn ngày trên lịch để tiếp tục.
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAddSchedule(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleAddSchedule}
                  disabled={
                    !scheduleDate || !scheduleTime || addScheduleSlot.isPending
                  }
                >
                  {addScheduleSlot.isPending ? "Đang thêm..." : "Thêm buổi học"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ============ TAB 3: STUDENTS ============ */}
        <TabsContent value="students" className="space-y-6">
          <h2 className="text-lg font-semibold">Danh sách học viên</h2>

          {enrollmentLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Chưa có học viên nào đăng ký.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Avatar>
                      <AvatarImage
                        src={enrollment.learnerProfile?.avatarUrl ?? ""}
                        alt={enrollment.learnerProfile?.name ?? "Học viên"}
                      />
                      <AvatarFallback>
                        {enrollment.learnerProfile?.name
                          ?.charAt(0)
                          ?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {enrollment.learnerProfile?.name ?? "Không có tên"}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {enrollment.learnerProfile?.email ?? "—"}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {enrollmentStatusLabel[enrollment.status] ??
                            enrollment.status}
                        </Badge>
                        <Badge
                          variant={
                            paymentStatusVariant[enrollment.paymentStatus]
                          }
                        >
                          {paymentStatusLabel[enrollment.paymentStatus] ??
                            enrollment.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                    {enrollment.paymentStatus === "PENDING_REVIEW" && (
                      <div className="flex shrink-0 gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm">
                              <CheckCircle2 className="size-4" />
                              Xác nhận thanh toán
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Xác nhận thanh toán
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Xác nhận học viên{" "}
                                <strong>
                                  {enrollment.learnerProfile?.name ??
                                    "Không có tên"}
                                </strong>{" "}
                                đã thanh toán{" "}
                                {enrollment?.amountVnd?.toLocaleString(
                                  "vi-VN"
                                ) ?? "0"}
                                ₫?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Quay lại</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  setSettleEnrollmentId(enrollment.id)
                                  setTimeout(() => handleSettleEnrollment(), 0)
                                }}
                                disabled={settleEnrollment.isPending}
                              >
                                {settleEnrollment.isPending
                                  ? "Đang xử lý..."
                                  : "Xác nhận"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <XCircle className="size-4" />
                              Từ chối
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Từ chối thanh toán
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Từ chối thanh toán của học viên{" "}
                                <strong>
                                  {enrollment.learnerProfile?.name ??
                                    "Không có tên"}
                                </strong>
                                ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Quay lại</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => {
                                  setRejectEnrollmentId(enrollment.id)
                                  setTimeout(() => handleRejectEnrollment(), 0)
                                }}
                                disabled={rejectEnrollment.isPending}
                              >
                                {rejectEnrollment.isPending
                                  ? "Đang xử lý..."
                                  : "Từ chối"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
