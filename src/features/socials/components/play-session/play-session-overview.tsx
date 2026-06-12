"use client"

import { format } from "date-fns"
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Play,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  completePlaySession,
  startPlaySession,
} from "@/features/socials/actions/play-session"
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
  isHost = false,
  socialId = "",
}: {
  session: PlaySession
  participants: PlaySessionParticipant[]
  duration: number
  completedMatchesCount: number
  activeMatchesCount: number
  upcomingMatchesCount: number
  isHost?: boolean
  socialId?: string
}) {
  const { t } = useSocialsTranslation()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const isCompleted = session.status === "COMPLETED"
  const isActive = session.status === "LIVE" || session.status === "IN_PROGRESS"
  const isNotStarted = !isCompleted && !isActive

  const handleStart = async () => {
    if (!socialId) return
    setIsPending(true)
    try {
      await startPlaySession(socialId, session.id)
      toast.success(
        t("sessions.startSuccess") || "Play session started successfully!"
      )
      router.refresh()
    } catch (error) {
      console.error("Error starting play session:", error)
      const message = error instanceof Error ? error.message : ""
      toast.error(
        message || t("sessions.startError") || "Failed to start play session"
      )
    } finally {
      setIsPending(false)
    }
  }

  const handleComplete = async () => {
    if (!socialId) return
    setIsPending(true)
    try {
      await completePlaySession(socialId, session.id)
      toast.success(
        t("sessions.completeSuccess") || "Play session completed successfully!"
      )
      router.refresh()
    } catch (error) {
      console.error("Error completing play session:", error)
      const message = error instanceof Error ? error.message : ""
      toast.error(
        message ||
          t("sessions.completeError") ||
          "Failed to complete play session"
      )
    } finally {
      setIsPending(false)
    }
  }

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

      {isHost && !isCompleted && (
        <>
          <Separator className="my-6" />
          <div className="flex flex-wrap items-center gap-3">
            {isNotStarted && (
              <Button
                onClick={handleStart}
                disabled={isPending}
                className="gap-2"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Play className="size-4 fill-current" />
                )}
                {t("sessions.startSession")}
              </Button>
            )}
            {isActive && (
              <Button
                onClick={handleComplete}
                disabled={isPending}
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-600/90"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {t("sessions.completeSession")}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
