"use client"

import { format } from "date-fns"
import { BookOpen, Calendar, ChevronLeft, Clock } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { useCoachLearnerDetail } from "../hooks/use-coach-queries"

function safeFormatDateTime(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return format(date, "dd/MM/yyyy HH:mm")
}

export function CoachLearnerDetailPanel({
  learnerId,
  onBack,
}: {
  learnerId: string
  onBack: () => void
}) {
  const { data, isLoading } = useCoachLearnerDetail(learnerId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-60 rounded-2xl" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Không tìm thấy thông tin học viên.
        </CardContent>
      </Card>
    )
  }

  const enrollments = data.enrollments ?? []
  const bookings = data.bookings ?? []
  const upcomingSessions = data.upcomingSessions ?? []

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="gap-2 rounded-full" onClick={onBack}>
        <ChevronLeft className="size-4" />
        Quay lại
      </Button>

      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row">
          <Avatar className="size-16">
            <AvatarImage
              src={data.avatarUrl || "/placeholder.svg"}
              alt={data.name}
            />
            <AvatarFallback className="text-lg">
              {data.name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xl font-semibold">
              {data.name || "Không có tên"}
            </p>
            <p className="text-sm text-muted-foreground">{data.email || "-"}</p>
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="secondary" className="rounded-full">
                {data.totalSessions} tổng buổi
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                {data.completedSessions} đã hoàn thành
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {upcomingSessions.length > 0 && (
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-4" />
              Buổi sắp tới
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingSessions.map((session, index) => {
              const sessionKey =
                session.title + (session.startTime ?? `session-${index}`)
              return (
                <div
                  key={sessionKey}
                  className="flex items-center justify-between rounded-xl border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {session.title || "Không có tiêu đề"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <Clock className="inline size-3.5 align-middle" />{" "}
                      {safeFormatDateTime(session.startTime)} -{" "}
                      {safeFormatDateTime(session.endTime)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      session.status === "live" ? "default" : "secondary"
                    }
                    className="rounded-full"
                  >
                    {session.status === "live" ? "Đang diễn ra" : "Sắp tới"}
                  </Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4" />
              Lớp đã tham gia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa tham gia lớp nào.
              </p>
            ) : (
              <div className="space-y-3">
                {enrollments.map((enr, index) => {
                  const enrKey =
                    enr.classId ?? enr.className ?? `enrollment-${index}`
                  return (
                    <div
                      key={enrKey}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <p className="text-sm font-medium">
                        {enr.className || "Không xác định"}
                      </p>
                      <Badge
                        variant="outline"
                        className="rounded-full text-[11px]"
                      >
                        {enr.status === "active"
                          ? "Đang học"
                          : enr.status === "completed"
                            ? "Đã hoàn thành"
                            : "Đã hủy"}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-4" />
              Lịch đặt riêng
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có lịch đặt riêng.
              </p>
            ) : (
              <div className="space-y-3">
                {bookings.map((bk, index) => {
                  const bkKey = bk.bookingId ?? `booking-${index}`
                  return (
                    <div
                      key={bkKey}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">
                          {safeFormatDateTime(bk.scheduledAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {bk.durationMinutes ?? 0} phút
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="rounded-full text-[11px]"
                      >
                        {bk.status === "confirmed"
                          ? "Đã xác nhận"
                          : bk.status === "completed"
                            ? "Đã hoàn thành"
                            : "Đã hủy"}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
