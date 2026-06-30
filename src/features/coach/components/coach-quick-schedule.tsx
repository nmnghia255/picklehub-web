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
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle>Lịch hôm nay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="rounded-2xl border p-4">
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
