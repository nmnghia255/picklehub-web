"use client"

import { AlertTriangle, CalendarDays, DollarSign, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { useSession } from "@/features/auth/hooks/use-session"
import { useCoachLearnerDashboard } from "../hooks/use-coach-queries"

export function CoachDashboardStats() {
  const session = useSession()
  const { data, isLoading } = useCoachLearnerDashboard({ enabled: !!session?.user })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="mb-2 size-4" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu thống kê. Vui lòng quay lại sau.
        </CardContent>
      </Card>
    )
  }

  const stats = [
    { icon: Users, label: "Tổng học viên", value: data.totalLearners },
    {
      icon: DollarSign,
      label: "Thanh toán lớp chờ duyệt",
      value: data.learnersWithPendingClassPayments,
    },
    {
      icon: DollarSign,
      label: "Thanh toán đặt lịch chờ duyệt",
      value: data.learnersWithPendingBookingPayments,
    },
    {
      icon: CalendarDays,
      label: "Học viên có lịch sắp tới",
      value: data.learnersWithUpcomingSessions,
    },
    {
      icon: CalendarDays,
      label: "Tổng lịch sắp tới",
      value: data.upcomingSessionTotal,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-2xl border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-sm">{stat.label}</span>
                <stat.icon className="size-4" />
              </div>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.attentionLearners.length > 0 && (
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-500" />
              Học viên cần chú ý
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.attentionLearners.map((learner, index) => (
              <div
                key={learner.learnerProfile?.name ?? index}
                className="flex flex-wrap items-center gap-4 rounded-xl border p-4"
              >
                <Avatar className="size-10">
                  <AvatarImage
                    src={learner.learnerProfile?.avatarUrl ?? ""}
                    alt={learner.learnerProfile?.name ?? "?"}
                  />
                  <AvatarFallback>
                    {(learner.learnerProfile?.name ?? "?")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {learner.learnerProfile?.name ?? "?"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {learner.upcomingSessionCount} buổi sắp tới
                  </Badge>
                  {learner.classPaymentPendingReviewCount > 0 && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-amber-300 text-amber-700"
                    >
                      {learner.classPaymentPendingReviewCount} thanh toán lớp
                    </Badge>
                  )}
                  {learner.bookingPaymentPendingReviewCount > 0 && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-amber-300 text-amber-700"
                    >
                      {learner.bookingPaymentPendingReviewCount} thanh toán đặt
                      lịch
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
