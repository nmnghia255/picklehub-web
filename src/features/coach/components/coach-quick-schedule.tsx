import { CalendarX } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TodayScheduleItem = {
  id: string
  time: string
  target: string
  location: string
  lessonPlan: string
  status: "upcoming" | "live" | "pending"
}

type CoachQuickScheduleProps = {
  schedules: TodayScheduleItem[]
}

const statusVariantMap = {
  upcoming: "secondary",
  live: "default",
  pending: "outline",
} as const

export function CoachQuickSchedule({ schedules }: CoachQuickScheduleProps) {
  const { t } = useTranslation("common")
  const statusLabelMap = {
    upcoming: t("coach.schedule.statusUpcoming"),
    live: t("coach.schedule.statusLive"),
    pending: t("coach.schedule.statusPending"),
  } as const
  if (schedules.length === 0) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>{t("coach.schedule.todayScheduleTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarX className="mb-3 size-10 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              {t("coach.schedule.noSchedule")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("coach.schedule.noScheduleDescription")}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle>{t("coach.schedule.todayScheduleTitle")}</CardTitle>
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
                    {statusLabelMap[schedule.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {schedule.target}
                </p>
                <p className="text-sm text-muted-foreground">
                  {schedule.location}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("coach.schedule.lessonPlan", {
                    plan: schedule.lessonPlan,
                  })}
                </p>
              </div>

              <Button variant="outline" className="rounded-full">
                {t("coach.schedule.viewDetailButton")}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
