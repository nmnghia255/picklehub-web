"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getRegisteredCoachesByLearner,
  learnerPayments,
  learnerProfile,
  learnerSchedules,
} from "@/features/learner/data/learner-mock-data"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ"
}

export function LearnerOverview() {
  const registeredCoaches = getRegisteredCoachesByLearner(learnerProfile.id)
  const totalSessions = learnerSchedules.filter(
    (s) => s.status === "Hoàn thành"
  ).length
  const upcomingSessions = learnerSchedules.filter(
    (s) => s.status === "Đã xác nhận" || s.status === "Chờ xác nhận"
  ).length
  const totalPaid = learnerPayments
    .filter((p) => p.status === "Đã thanh toán")
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Buổi đã học
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {totalSessions}
            </p>
            <p className="text-xs text-muted-foreground">
              Tổng số buổi đã hoàn thành
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Buổi sắp tới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {upcomingSessions}
            </p>
            <p className="text-xs text-muted-foreground">Lịch tập trong tuần</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {formatCurrency(totalPaid)}
            </p>
            <p className="text-xs text-muted-foreground">Tổng tiền đã đóng</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              HLV đang theo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {registeredCoaches.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {registeredCoaches.map((c) => c.name).join(", ")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle>Lịch tập sắp tới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {learnerSchedules
              .filter(
                (s) => s.status === "Đã xác nhận" || s.status === "Chờ xác nhận"
              )
              .map((schedule) => (
                <div key={schedule.id} className="rounded-2xl border p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {schedule.day} ({schedule.date})
                      </p>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {schedule.sessionName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      HLV: {schedule.coachName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {schedule.location}
                    </p>
                  </div>
                </div>
              ))}
            {learnerSchedules.filter(
              (s) => s.status === "Đã xác nhận" || s.status === "Chờ xác nhận"
            ).length === 0 && (
              <p className="text-sm text-muted-foreground">
                Không có lịch tập sắp tới.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle>Thanh toán gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {learnerPayments.slice(0, 3).map((payment) => (
              <div key={payment.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.date}
                    </p>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
