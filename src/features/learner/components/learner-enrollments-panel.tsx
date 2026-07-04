"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { CreditCard, Upload, XCircle, CheckCircle2, Clock, AlertTriangle, Banknote } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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

import { ErrorState } from "@/components/shared/error-state"
import { getErrorMessage } from "@/lib/api-client"
import { useSession } from "@/features/auth/hooks/use-session"
import { useMyEnrollments, useUploadEnrollmentPaymentProof, useCancelEnrollment } from "@/features/learner/hooks/use-learner-queries"

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  PENDING_PROOF: {
    label: "Chờ tải bằng chứng",
    className: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="size-3" />,
  },
  PENDING_REVIEW: {
    label: "Đang chờ xác nhận",
    className: "bg-blue-100 text-blue-800",
    icon: <AlertTriangle className="size-3" />,
  },
  SETTLED: {
    label: "Đã thanh toán",
    className: "bg-green-100 text-green-800",
    icon: <CheckCircle2 className="size-3" />,
  },
  REJECTED: {
    label: "Bị từ chối",
    className: "bg-red-100 text-red-800",
    icon: <XCircle className="size-3" />,
  },
}

const ENROLLMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Đang hoạt động", className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", className: "bg-gray-100 text-gray-800" },
  COMPLETED: { label: "Đã hoàn thành", className: "bg-blue-100 text-blue-800" },
}

const LEVEL_LABEL: Record<string, string> = {
  Beginner: "Cơ bản",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
  Pro: "Chuyên nghiệp",
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "₫"
}

function EnrollmentSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-32" />
      </CardFooter>
    </Card>
  )
}

function UploadDialog({
  enrollmentId,
  triggerLabel,
}: {
  enrollmentId: string
  triggerLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const uploadMutation = useUploadEnrollmentPaymentProof()

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast.error("Vui lòng nhập URL bằng chứng thanh toán")
      return
    }
    try {
      await uploadMutation.mutateAsync({ enrollmentId, paymentProofUrl: url.trim() })
      toast.success("Tải lên bằng chứng thanh toán thành công")
      setOpen(false)
      setUrl("")
    } catch {
      toast.error("Tải lên bằng chứng thất bại")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-1 size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tải lên bằng chứng thanh toán</DialogTitle>
          <DialogDescription>
            Vui lòng cung cấp đường dẫn đến hình ảnh bằng chứng chuyển khoản của bạn.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium">URL bằng chứng thanh toán</label>
          <Input
            placeholder="https://example.com/chung-tu.png"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? "Đang tải..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CancelDialog({ enrollmentId }: { enrollmentId: string }) {
  const cancelMutation = useCancelEnrollment()

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(enrollmentId)
      toast.success("Hủy đăng ký thành công")
    } catch {
      toast.error("Hủy đăng ký thất bại")
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <XCircle className="mr-1 size-4" />
          Hủy đăng ký
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận hủy đăng ký</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn hủy đăng ký lớp học này? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Quay lại</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} disabled={cancelMutation.isPending}>
            {cancelMutation.isPending ? "Đang hủy..." : "Xác nhận hủy"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function LearnerEnrollmentsPanel() {
  const session = useSession()
  const { data: enrollments, isLoading, isError, error, refetch } = useMyEnrollments({ enabled: !!session?.user })

  if (isError) {
    return (
      <ErrorState
        title="Không thể tải danh sách đăng ký"
        description={getErrorMessage(error)}
        retry={refetch}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <EnrollmentSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CreditCard className="mb-4 size-12 text-muted-foreground" />
          <p className="mb-2 text-center text-lg font-medium">
            Bạn chưa đăng ký lớp học nào.
          </p>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Khám phá các lớp học ngay!
          </p>
          <Button asChild>
            <Link href="/classes">Khám phá lớp học</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {enrollments.map((enrollment, idx) => {
        const paymentCfg = PAYMENT_STATUS_CONFIG[enrollment.paymentStatus]
        const enrollmentCfg = ENROLLMENT_STATUS_CONFIG[enrollment.status]

        return (
          <Card key={enrollment.id ?? `enrollment-${idx}`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{enrollment.className || "Lớp học"}</CardTitle>
                  <CardDescription>
                    {enrollment.classLevel ? LEVEL_LABEL[enrollment.classLevel] ?? enrollment.classLevel : ""}
                    {enrollment.locationDescription ? ` • ${enrollment.locationDescription}` : ""}
                    {enrollment.scheduleDate
                      ? ` • ${new Date(enrollment.scheduleDate).toLocaleDateString("vi-VN")}`
                      : ""}
                  </CardDescription>
                </div>
                {enrollmentCfg && (
                  <Badge className={enrollmentCfg.className}>{enrollmentCfg.label}</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                {enrollment.coachName && (
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarImage src={enrollment.coachAvatar} />
                      <AvatarFallback>
                        {(enrollment.coachName ?? "CT")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {enrollment.coachName ?? "Huấn luyện viên"}
                    </span>
                  </div>
                )}

                <div className="ml-auto flex items-center gap-2">
                  {paymentCfg && (
                    <Badge className={paymentCfg.className}>
                      {paymentCfg.icon}
                      {paymentCfg.label}
                    </Badge>
                  )}
                  <span className="text-sm font-semibold">
                    {formatAmount(enrollment.amountVnd)}
                  </span>
                </div>
              </div>

              {enrollment.paymentBankName && (
                <div className="rounded-lg border bg-muted/50 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Banknote className="size-4" />
                    Thông tin chuyển khoản
                  </div>
                  <div className="space-y-0.5 text-sm">
                    <p>
                      Ngân hàng:{" "}
                      <span className="font-medium">
                        {enrollment.paymentBankName}
                      </span>
                    </p>
                    <p>
                      Số tài khoản:{" "}
                      <span className="font-medium">
                        {enrollment.paymentAccountNumber}
                      </span>
                    </p>
                    <p>
                      Chủ tài khoản:{" "}
                      <span className="font-medium">
                        {enrollment.paymentAccountName}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2">
              {enrollment.paymentStatus === "PENDING_PROOF" && (
                <UploadDialog
                  enrollmentId={enrollment.id}
                  triggerLabel="Tải lên bằng chứng thanh toán"
                />
              )}
              {enrollment.paymentStatus === "PENDING_REVIEW" && (
                <Button variant="outline" size="sm" disabled>
                  <Clock className="mr-1 size-4" />
                  Đang chờ xác nhận
                </Button>
              )}
              {enrollment.paymentStatus === "REJECTED" && (
                <UploadDialog
                  enrollmentId={enrollment.id}
                  triggerLabel="Tải lại bằng chứng"
                />
              )}
              {enrollment.paymentStatus === "SETTLED" && (
                <Button variant="outline" size="sm" disabled>
                  <CheckCircle2 className="mr-1 size-4" />
                  Đã thanh toán
                </Button>
              )}

              {enrollment.status === "ACTIVE" && (
                <CancelDialog enrollmentId={enrollment.id} />
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
