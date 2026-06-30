"use client"

import { ArrowRight, CalendarDays, UserPlus } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  dashboardStats,
  quickActions,
  todaySchedule,
} from "@/features/coach/data/mockDashboard"

const statusVariantMap = {
  "Sắp bắt đầu": "secondary",
  "Đang diễn ra": "default",
  "Chưa bắt đầu": "outline",
} as const

export function CoachDashboardStats() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-3xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.hint}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Lịch hôm nay</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Danh sách buổi học trong ngày để thao tác nhanh khi đang dạy.
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full">
              Today Schedule
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaySchedule.map((item) => (
              <div key={item.id} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{item.time}</p>
                      <Badge
                        variant={statusVariantMap[item.status]}
                        className="rounded-full"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.target}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.location}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Giáo án:{" "}
                      <span className="font-medium text-foreground">
                        {item.lessonPlan}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href="/coach/schedule">
                        <CalendarDays className="size-4" />
                        Xem chi tiết
                      </Link>
                    </Button>
                    <Button className="rounded-full">
                      <ArrowRight className="size-4" />
                      Bắt đầu buổi học
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle>Hành động nhanh</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Truy cập nhanh các tác vụ hay dùng nhất.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                asChild
                variant="outline"
                className="h-12 w-full justify-start rounded-2xl"
              >
                <Link href={action.href}>
                  {action.label === "Thêm học viên" ? (
                    <UserPlus className="size-4" />
                  ) : null}
                  {action.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
