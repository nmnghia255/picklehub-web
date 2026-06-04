"use client"

import { format } from "date-fns"
import { CalendarDays, Clock3, MapPin } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import type {
  PlaySession,
  PlaySessionParticipant,
} from "../../types/play-session"
import { InfoRow } from "../social-detail/infor-row"

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <Card className="p-0">
      <CardContent className="p-5">
        <div className="text-3xl font-semibold">{value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}

export default function PlaySessionOverview({
  session,
  participants,
  duration,
  completedMatchesCount,
  activeMatchesCount,
  upcomingMatchesCount,
}: {
  session: PlaySession
  participants: PlaySessionParticipant[]
  duration: number
  completedMatchesCount: number
  activeMatchesCount: number
  upcomingMatchesCount: number
}) {
  const { t } = useSocialsTranslation()

  return (
    <div className="space-y-0">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard value={duration} label={t("playSessionOverview.minutes")} />
        <StatCard
          value={participants.length}
          label={t("playSessionOverview.players")}
        />
        <StatCard
          value={completedMatchesCount}
          label={t("playSessionOverview.completed")}
        />
        <StatCard
          value={upcomingMatchesCount + activeMatchesCount}
          label={t("playSessionOverview.upcomingActive")}
        />
      </div>

      <Separator className="my-6" />

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoRow
          icon={<CalendarDays className="size-5" />}
          label={t("playSessionOverview.date")}
          value={format(new Date(session.startTime), "MMM d, yyyy")}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <InfoRow
          icon={<Clock3 className="size-5" />}
          label={t("playSessionOverview.time")}
          value={`${format(new Date(session.startTime), "h:mm a")} - ${format(new Date(session.endTime), "h:mm a")}`}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        {/* <InfoRow
          icon={<Building className="size-5" />}
          label={t("playSessionOverview.sportCenter")}
          value={session.sportCenter || "-"}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        /> */}
        <InfoRow
          icon={<MapPin className="size-5" />}
          label={t("playSessionOverview.location")}
          value={session.location || "-"}
          iconClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400"
        />
      </div>
    </div>
  )
}
