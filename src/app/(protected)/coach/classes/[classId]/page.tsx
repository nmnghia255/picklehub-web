"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  Send,
  XCircle,
  CheckCircle2,
  Clock,
  Users,
  CalendarDays,
  DollarSign,
  MapPin,
  BookOpen,
} from "lucide-react"

import { useSession } from "@/features/auth/hooks/use-session"
import {
  useMyClassDetail,
  useUpdateClass,
  usePublishClass,
  useCancelClass,
  useClassScheduleEntries,
  useAddScheduleSlot,
  useRemoveScheduleSlot,
  useClassEnrollments,
  useSettleEnrollmentPayment,
  useRejectEnrollmentPayment,
} from "@/features/coach/hooks/use-coach-queries"
import type { ClassStatus, CoachLevel, PaymentStatus, EnrollmentStatus } from "@/features/coach/types/coach"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageContainer } from "@/components/page-container"

const statusLabel: Record<ClassStatus, string> = {
  DRAFT: "Nháp",
  OPEN: "Đang mở",
  FULL: "Đã đầy",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã kết thúc",
  CANCELLED: "Đã hủy",
}

const statusVariant: Record<ClassStatus, "default" | "secondary" | "destructive" | "outline"> = {
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

const paymentStatusVariant: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
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

  const { data: classData, isLoading, isError } = useMyClassDetail(classId, { enabled: !!session?.user })
  const { data: scheduleData, isLoading: scheduleLoading } = useClassScheduleEntries(classId, undefined, { enabled: !!session?.user })
  const { data: enrollmentData, isLoading: enrollmentLoading } = useClassEnrollments(classId, { enabled: !!session?.user })

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
  const [scheduleScheduledAt, setScheduleScheduledAt] = useState("")
  const [scheduleDuration, setScheduleDuration] = useState(60)
  const [scheduleTopic, setScheduleTopic] = useState("")
  const [scheduleNote, setScheduleNote] = useState("")

  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null)

  const [settleEnrollmentId, setSettleEnrollmentId] = useState<string | null>(null)
  const [rejectEnrollmentId, setRejectEnrollmentId] = useState<string | null>(null)

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
      setStartDate(classData.startDate ? dayjs(classData.startDate).format("YYYY-MM-DD") : "")
      setEndDate(classData.endDate ? dayjs(classData.endDate).format("YYYY-MM-DD") : "")
    }
  }, [classData])

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
  const isCancellable = classData.status !== "COMPLETED" && classData.status !== "CANCELLED"

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
        onError: (err: Error) => toast.error(err.message || "Cập nhật thất bại"),
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
    addScheduleSlot.mutate(
      {
        classId,
        dto: {
          scheduledAt: new Date(scheduleScheduledAt).toISOString(),
          durationMinutes: scheduleDuration,
          topic: scheduleTopic || undefined,
          note: scheduleNote || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Thêm buổi học thành công")
          setShowAddSchedule(false)
          setScheduleScheduledAt("")
          setScheduleDuration(60)
          setScheduleTopic("")
          setScheduleNote("")
        },
        onError: (err: Error) => toast.error(err.message || "Thêm buổi học thất bại"),
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
        onError: (err: Error) => toast.error(err.message || "Xóa buổi học thất bại"),
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
        onError: (err: Error) => toast.error(err.message || "Xác nhận thất bại"),
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

  const schedules = scheduleData ?? []
  const enrollments = enrollmentData ?? []

  return (
    <PageContainer variant="wide" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/coach?tab=classes">← Quay lại</Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{classData.title}</h1>
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
                  <Button onClick={handleUpdate} disabled={updateClass.isPending}>
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
                      Bạn có chắc muốn hủy lớp học này? Hành động này không thể hoàn tác.
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
            <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-3">
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
                  <p className="text-lg font-semibold truncate">
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
            <div className="space-y-3">
              {schedules.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="flex items-start justify-between gap-4 p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CalendarDays className="size-4 text-muted-foreground" />
                        {dayjs(entry.scheduledAt).format("DD/MM/YYYY")}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        {dayjs(entry.scheduledAt).format("HH:mm")}
                        {" — "}
                        {entry.durationMinutes} phút
                      </div>
                      {entry.topic && <p className="text-sm">{entry.topic}</p>}
                      {entry.note && (
                        <p className="text-xs text-muted-foreground">{entry.note}</p>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0 text-destructive">
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa buổi học</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa buổi học ngày{" "}
                            {dayjs(entry.scheduledAt).format("DD/MM/YYYY HH:mm")}?
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
              ))}
            </div>
          )}

          {/* Add Schedule Dialog */}
          <Dialog open={showAddSchedule} onOpenChange={setShowAddSchedule}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm buổi học</DialogTitle>
                <DialogDescription>
                  Điền thông tin buổi học mới cho lớp này.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduleAt">Thời gian</Label>
                  <Input
                    id="scheduleAt"
                    type="datetime-local"
                    value={scheduleScheduledAt ?? ""}
                    onChange={(e) => setScheduleScheduledAt(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduleDuration">Thời lượng</Label>
                  <Select
                    value={String(scheduleDuration ?? 60)}
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
                    value={scheduleTopic ?? ""}
                    onChange={(e) => setScheduleTopic(e.target.value)}
                    placeholder="Ví dụ: Kỹ thuật giao bóng"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduleNote">Ghi chú</Label>
                  <Textarea
                    id="scheduleNote"
                    value={scheduleNote ?? ""}
                    onChange={(e) => setScheduleNote(e.target.value)}
                    rows={3}
                    placeholder="Ghi chú thêm (không bắt buộc)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddSchedule(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleAddSchedule}
                  disabled={!scheduleScheduledAt || addScheduleSlot.isPending}
                >
                  {addScheduleSlot.isPending ? "Đang thêm..." : "Thêm"}
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
                        {enrollment.learnerProfile?.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {enrollment.learnerProfile?.name ?? "Không có tên"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {enrollment.learnerProfile?.email ?? "—"}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {enrollmentStatusLabel[enrollment.status] ?? enrollment.status}
                        </Badge>
                        <Badge variant={paymentStatusVariant[enrollment.paymentStatus]}>
                          {paymentStatusLabel[enrollment.paymentStatus] ?? enrollment.paymentStatus}
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
                              <AlertDialogTitle>Xác nhận thanh toán</AlertDialogTitle>
                              <AlertDialogDescription>
                                Xác nhận học viên{" "}
                                <strong>{enrollment.learnerProfile?.name ?? "Không có tên"}</strong> đã thanh toán{" "}
                                {enrollment?.amountVnd?.toLocaleString("vi-VN") ?? "0"}₫?
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
                                {settleEnrollment.isPending ? "Đang xử lý..." : "Xác nhận"}
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
                              <AlertDialogTitle>Từ chối thanh toán</AlertDialogTitle>
                              <AlertDialogDescription>
                                Từ chối thanh toán của học viên{" "}
                                <strong>{enrollment.learnerProfile?.name ?? "Không có tên"}</strong>?
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
                                {rejectEnrollment.isPending ? "Đang xử lý..." : "Từ chối"}
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
