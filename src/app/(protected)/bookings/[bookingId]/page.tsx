"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import dayjs from "dayjs"
import { Calendar, Clock, MapPin, Shield, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/shared/error-state"
import { PageContainer } from "@/components/page-container"
import { useLearnerSchedule } from "@/features/learner/hooks/use-learner-queries"
import { getErrorMessage } from "@/lib/api-client"

const statusLabel: Record<string, string> = {
  upcoming: "Sắp tới",
  live: "Đang diễn ra",
  past: "Đã kết thúc",
  pending: "Chờ xác nhận",
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  upcoming: "secondary",
  live: "default",
  past: "outline",
  pending: "secondary",
}

const paymentLabel: Record<string, string> = {
  PENDING_PROOF: "Chờ tải bằng chứng",
  PENDING_REVIEW: "Đang chờ xác nhận",
  SETTLED: "Đã thanh toán",
  REJECTED: "Bị từ chối",
}

function BookingDetailSkeleton() {
  return (
    <PageContainer variant="wide" className="space-y-6 py-8">
      <Skeleton className="h-32 rounded-xl" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-40 rounded-xl" />
    </PageContainer>
  )
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

export default function BookingDetailPage() {
  const params = useParams()
  const bookingId = params.bookingId as string
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: Infinity,
  })

  const { data, isLoading, isError, error, refetch } = useLearnerSchedule(
    { kind: "booking", limit: 200, sort: "desc" },
    { enabled: !!session?.user }
  )

  const booking = useMemo(
    () => data?.data.find((item) => item.bookingId === bookingId) ?? null,
    [bookingId, data?.data]
  )

  if (isSessionLoading || isLoading) {
    return <BookingDetailSkeleton />
  }

  if (isError) {
    return (
      <PageContainer variant="wide" className="py-8">
        <ErrorState
          title="Không thể tải chi tiết đặt lịch"
          description={getErrorMessage(error)}
          retry={refetch}
        />
      </PageContainer>
    )
  }

  if (!booking) {
    return (
      <PageContainer variant="wide" className="space-y-6 py-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-lg font-medium">Đặt lịch không tồn tại</p>
            <p className="text-sm text-muted-foreground">
              Không tìm thấy đặt lịch này trong lịch tập của bạn.
            </p>
            <Button asChild>
              <Link href="/learner">Quay lại lịch tập</Link>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  const coachName = booking.coachProfile?.displayName ?? "Huấn luyện viên"
  const isVerified = booking.coachProfile?.verificationStatus === "VERIFIED"

  return (
    <PageContainer variant="wide" className="space-y-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Chi tiết đặt lịch</h1>
          <p className="text-sm text-muted-foreground">
            Xem thông tin buổi tập của bạn.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/learner">Quay lại</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Huấn luyện viên
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={booking.coachProfile?.avatarUrl ?? ""} alt={coachName} />
              <AvatarFallback>{coachName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold">{coachName}</p>
                {isVerified && (
                  <Badge variant="secondary" className="border-none">
                    <Shield className="mr-1 size-3.5" />
                    Đã xác thực
                  </Badge>
                )}
              </div>
              {booking.coachProfile?.locationCity && (
                <p className="text-sm text-muted-foreground">
                  {booking.coachProfile.locationCity}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trạng thái</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Trạng thái lịch</span>
              <Badge variant={statusVariant[booking.status] ?? "outline"}>
                {statusLabel[booking.status] ?? booking.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Thanh toán</span>
              <span className="font-medium">
                {booking.paymentStatus ? paymentLabel[booking.paymentStatus] ?? booking.paymentStatus : "-"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            Thông tin buổi tập
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 rounded-lg border p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Clock className="size-4 text-muted-foreground" />
              Thời gian
            </p>
            <p className="text-sm text-muted-foreground">
              {dayjs(booking.startsAt).format("DD/MM/YYYY HH:mm")}
              {" - "}
              {dayjs(booking.endsAt).format("HH:mm")}
            </p>
            <p className="text-sm text-muted-foreground">
              Thời lượng: {booking.durationMinutes} phút
            </p>
          </div>

          <div className="space-y-1 rounded-lg border p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="size-4 text-muted-foreground" />
              Địa điểm
            </p>
            <p className="text-sm text-muted-foreground">
              {booking.locationDescription ?? "Chưa có địa điểm"}
            </p>
          </div>

          <div className="space-y-1 rounded-lg border p-4 md:col-span-2">
            <p className="text-sm font-medium">Ghi chú</p>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {booking.note || "Không có ghi chú."}
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}