"use client"

import { BookOpen, CheckCircle2, GraduationCap, Users, UserPlus } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { useCoachLearnerDashboard } from "../hooks/use-coach-queries"

export function CoachDashboardStats() {
  const { data, isLoading } = useCoachLearnerDashboard()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="mb-2 size-4" />
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
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
    { icon: CheckCircle2, label: "Đang hoạt động", value: data.activeLearners },
    { icon: UserPlus, label: "Mới trong tháng", value: data.newThisMonth },
    { icon: BookOpen, label: "Học viên theo lớp", value: data.classLearners },
    { icon: GraduationCap, label: "Học viên đặt lịch", value: data.bookingLearners },
    { icon: Users, label: "Chưa tham gia lớp", value: data.unenrolledLearners },
  ]

  return (
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
  )
}
