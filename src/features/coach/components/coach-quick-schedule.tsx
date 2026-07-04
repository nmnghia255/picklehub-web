import { CalendarX } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TodayScheduleItem = {
  id: string
  time: string
  target: string
  location: string
  lessonPlan: string
  status: "Sắp bắt đầu" | "Đang diễn ra" | "Chưa bắt đầu"
}

type CoachQuickScheduleProps = {
  schedules: TodayScheduleItem[]
}

const statusVariantMap = {
  "Sắp bắt đầu": "secondary",
  "Đang diễn ra": "default",
  "Chưa bắt đầu": "outline",
} as const

export function CoachQuickSchedule({ schedules }: CoachQuickScheduleProps) {
  if (schedules.length === 0) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Lịch hôm nay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarX className="mb-3 size-10 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Chưa có lịch</p>
            <p className="text-xs text-muted-foreground">Hôm nay bạn không có lịch dạy nào.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle>Lịch hôm nay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedules.map((schedule, index) => (
          <div key={schedule.id ?? index} className="rounded-2xl border p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{schedule.time}</p>
                  <Badge
                    variant={statusVariantMap[schedule.status]}
                    className="rounded-full"
                  >
                    {schedule.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {schedule.target}
                </p>
                <p className="text-sm text-muted-foreground">
                  {schedule.location}
                </p>
                <p className="text-sm text-muted-foreground">
                  Giáo án: {schedule.lessonPlan}
                </p>
              </div>

              <Button variant="outline" className="rounded-full">
                Xem chi tiết
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
