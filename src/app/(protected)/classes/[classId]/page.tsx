"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { Banknote, Calendar, Clock, MapPin, Shield, Users } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { CoachClient } from "@/features/coach/api/coach-client"
import { coachQueryKeys } from "@/features/coach/api/query-keys"
import { useClassDetail } from "@/features/coach/hooks/use-coach-queries"
import { useMyEnrollments } from "@/features/learner/hooks/use-learner-queries"

const levelLabel: Record<string, string> = {
  Beginner: "Cơ bản",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
  Pro: "Chuyên nghiệp",
}

const statusLabel: Record<string, string> = {
  DRAFT: "Nháp",
  OPEN: "Đang mở",
  FULL: "Đã đầy",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã kết thúc",
  CANCELLED: "Đã hủy",
}

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  OPEN: "default",
  FULL: "secondary",
  ONGOING: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
}

const verificationLabel: Record<string, string> = {
  UNVERIFIED: "Chưa xác thực",
  PENDING: "Chờ xác thực",
  VERIFIED: "Đã xác thực",
  REJECTED: "Từ chối",
}

const enrollmentStatusLabel: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
}

function maskAccountNumber(num: string): string {
  if (num.length <= 4) return num
  return "****" + num.slice(-4)
}

async function fetchSession() {
  try {
    const response = await fetch("/api/auth/session")

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch {
    return null
  }
}

function ClassDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Skeleton className="h-56 w-full rounded-xl" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

export default function ClassDetailPage() {
  const params = useParams()
  const classId = params.classId as string
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: Infinity,
  })

  const [showBankDialog, setShowBankDialog] = useState(false)
  const [bankInfo, setBankInfo] = useState<{
    bankName: string
    bankAccountNumber: string
    bankAccountName: string
  } | null>(null)

  const { data: classData, isLoading, isError } = useClassDetail(classId)
  const { data: enrollments, isLoading: isLoadingEnrollments } =
    useMyEnrollments({
      enabled: !!session?.user,
    })

  const currentEnrollment = enrollments?.find(
    (enrollment) =>
      enrollment.classId === classId && enrollment.status !== "CANCELLED"
  )

  const queryClient = useQueryClient()
  const enrollMutation = useMutation({
    mutationFn: () => CoachClient.enrollInClass(classId),
    onSuccess: (enrollment) => {
      const info = enrollment.coachPaymentInfo
      if (info) {
        setBankInfo({
          bankName: info.paymentBankName,
          bankAccountNumber: info.paymentAccountNumber,
          bankAccountName: info.paymentAccountName,
        })
        setShowBankDialog(true)
      }
      queryClient.invalidateQueries({
        queryKey: coachQueryKeys.classDetail(classId),
      })
      queryClient.invalidateQueries({ queryKey: ["learner", "enrollments"] })
      toast.success("Đăng ký lớp học thành công!")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Đăng ký thất bại. Vui lòng thử lại.")
    },
  })

  if (isLoading) return <ClassDetailSkeleton />

  if (isError || !classData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">Lớp học không tồn tại</p>
      </div>
    )
  }

  const {
    title,
    description,
    level,
    status,
    coverImageUrl,
    capacity,
    enrolledCount,
    priceVnd,
    locationDescription,
    schedules,
    coachProfile,
  } = classData

  const spotsLeft = capacity - enrolledCount
  const isOpen = status === "OPEN"
  const isFull = status === "FULL" || spotsLeft <= 0
  const canEnroll = isOpen && !isFull
  const showEnrollmentAction =
    !isSessionLoading && (!isLoadingEnrollments || !session?.user)

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl bg-muted">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="h-56 w-full object-cover md:h-72"
          />
        ) : (
          <div className="h-56 w-full bg-gradient-to-br from-primary/20 to-primary/10 md:h-72" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute right-4 bottom-4 left-4 flex flex-wrap items-end gap-3">
          <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="border-none">
              {levelLabel[level] ?? level}
            </Badge>
            <Badge
              variant={statusVariant[status] ?? "outline"}
              className="border-none"
            >
              {statusLabel[status] ?? status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Coach */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar size="lg">
            <AvatarImage
              src={coachProfile.avatarUrl}
              alt={coachProfile.displayName}
            />
            <AvatarFallback>
              {coachProfile.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              Huấn luyện viên
            </span>
            <span className="text-lg font-semibold">
              {coachProfile.displayName}
            </span>
            {coachProfile.verificationStatus === "VERIFIED" && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Shield className="size-3.5" />
                {verificationLabel[coachProfile.verificationStatus]}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Giới thiệu lớp học</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-muted-foreground">
            {description || "Chưa có mô tả."}
          </p>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            Lịch học
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có lịch học.</p>
          ) : (
            <div className="space-y-4">
              {schedules.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-1 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="size-4 text-muted-foreground" />
                      {dayjs(entry.scheduledAt).format("DD/MM/YYYY")}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4" />
                      {dayjs(entry.scheduledAt).format("HH:mm")}
                      {" — "}
                      {entry.durationMinutes} phút
                    </div>
                    {entry.topic && <p className="text-sm">{entry.topic}</p>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {locationDescription || "Chưa có địa điểm"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price & Capacity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="size-5" />
              Học phí
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {priceVnd.toLocaleString("vi-VN")}
              <span className="ml-1 text-base font-normal text-muted-foreground">
                VNĐ
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Sức chứa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Đã đăng ký: {enrolledCount}/{capacity}
              </span>
              <span className="font-medium">
                {spotsLeft > 0 ? `Còn ${spotsLeft} chỗ` : "Đã đầy"}
              </span>
            </div>
            <Progress value={(enrolledCount / capacity) * 100} />
          </CardContent>
        </Card>
      </div>

      {/* Enrollment */}
      <Card>
        <CardContent className="pt-6">
          {currentEnrollment ? (
            <Button size="lg" className="w-full" disabled variant="secondary">
              {enrollmentStatusLabel[currentEnrollment.status] ?? "Đã đăng ký"}
            </Button>
          ) : canEnroll && showEnrollmentAction ? (
            <Button
              size="lg"
              className="w-full"
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
            >
              {enrollMutation.isPending ? "Đang xử lý..." : "Đăng ký ngay"}
            </Button>
          ) : canEnroll ? (
            <Button size="lg" className="w-full" disabled variant="secondary">
              Đang kiểm tra...
            </Button>
          ) : isFull ? (
            <Button size="lg" className="w-full" disabled variant="secondary">
              Lớp đã đầy
            </Button>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Trạng thái: {statusLabel[status] ?? status}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bank Info Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thông tin thanh toán</DialogTitle>
            <DialogDescription>
              Vui lòng chuyển khoản học phí đến tài khoản dưới đây và tải lên
              ảnh chụp biên lai để hoàn tất đăng ký.
            </DialogDescription>
          </DialogHeader>
          {bankInfo && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ngân hàng</span>
                <span className="font-medium">{bankInfo.bankName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Chủ tài khoản</span>
                <span className="font-medium">{bankInfo.bankAccountName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Số tài khoản</span>
                <span className="font-medium tracking-widest">
                  {maskAccountNumber(bankInfo.bankAccountNumber)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Số tiền</span>
                <span className="font-medium">
                  {priceVnd.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
