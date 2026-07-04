"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useSession } from "@/features/auth/hooks/use-session"
import { useLearnerSchedule } from "@/features/learner/hooks/use-learner-queries"
import { BadgeCheck, BookOpen, Calendar, Clock, Star, TrendingUp } from "lucide-react"

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    weekday: "short", day: "numeric", month: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export function LearnerOverview() {
  const session = useSession()
  const { data, isLoading, error } = useLearnerSchedule({ limit: 5, sort: "asc" }, { enabled: !!session?.user })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-destructive">Không thể tải dữ liệu tổng quan.</p>
          <p className="mt-1 text-sm text-muted-foreground">Vui lòng thử lại sau.</p>
        </CardContent>
      </Card>
    )
  }

  const summary = data?.summary
  const upcomingItems = data?.data?.filter(
    (item) => item.status === "upcoming" || item.status === "live"
  ) ?? []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="size-4" />
              Tổng số buổi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BookOpen className="size-4" />
              Lớp học
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.classCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Star className="size-4" />
              Đặt lịch riêng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.bookingCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="size-4" />
              Sắp diễn ra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{summary?.upcomingCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BadgeCheck className="size-4" />
              HLV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.distinctCoachCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="size-5" />
            Buổi sắp tới
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="mb-2 size-10 text-muted-foreground" />
              <p className="text-muted-foreground">Bạn chưa có buổi học nào sắp tới</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingItems.map((item, idx) => (
                <div key={item.id ?? `upcoming-${idx}`} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{item.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-3.5" />
                      <span>{formatDateTime(item.startsAt)}</span>
                      <span className="text-xs">
                        ({Math.round((new Date(item.endsAt).getTime() - new Date(item.startsAt).getTime()) / 60000)} phút)
                      </span>
                    </div>
                    {item.coachProfile && (
                      <p className="text-sm text-muted-foreground">
                        HLV: {item.coachProfile.displayName}
                      </p>
                    )}
                  </div>
                  <Badge variant={item.status === "live" ? "default" : "secondary"}>
                    {item.status === "live" ? "Đang diễn ra" : "Sắp tới"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
