"use client"

import { format } from "date-fns"
import {
  Banknote,
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
import { useSession } from "@/features/auth/hooks/use-session"
import {
  completePlaySession,
  startPlaySession,
} from "@/features/socials/actions/play-session"
import {
  canJoinPlaySession,
  canLeavePlaySession,
  getPlaySessionCapacityText,
  isActiveSocialParticipantStatus,
  isCancelledPlaySessionStatus,
  isCompletedPlaySessionStatus,
  isFullPlaySession,
  isInProgressPlaySessionStatus,
  isOpenPlaySessionStatus,
} from "@/features/socials/utils"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import type { PlaySessionCardMatch } from "../../types/match"
import type {
  PlaySession,
  PlaySessionParticipant,
} from "../../types/play-session"
import { InfoRow } from "../social-detail/infor-row"

function StatCard({
  value,
  label,
  children,
}: {
  value: string | number
  label: string
  children?: React.ReactNode
}) {
  return (
    <Card className="p-0">
      <CardContent className="flex h-full flex-col justify-center px-4 py-6">
        <div>
          <div className="text-2xl leading-none font-bold tracking-tight">
            {value}
          </div>
          <div className="mt-1.5 text-xs leading-none font-medium text-muted-foreground">
            {label}
          </div>
        </div>
        {children && <div className="mt-2">{children}</div>}
      </CardContent>
    </Card>
  )
}

export default function PlaySessionOverview({
  session,
  participants,
  duration,
  matches = [],
  isHost = false,
  socialId,
  onJoin,
  onLeave,
}: {
  session: PlaySession
  participants: PlaySessionParticipant[]
  duration: number
  matches?: PlaySessionCardMatch[]
  isHost: boolean
  socialId?: string
  onJoin: () => void
  onLeave: () => void
}) {
  const { t } = useSocialsTranslation()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const sessionData = useSession()

  const isCompleted = isCompletedPlaySessionStatus(session.status)
  const isCancelled = isCancelledPlaySessionStatus(session.status)
  const isActive = isInProgressPlaySessionStatus(session.status)
  const canStart =
    isHost && isOpenPlaySessionStatus(session.status) && !isCancelled
  const canComplete = isHost && !isCompleted && !isCancelled && isActive

  const handleStart = async () => {
    if (!socialId || !canStart) return
    setIsPending(true)
    try {
      await startPlaySession(socialId, session.id)
      toast.success(t("sessions.startSuccess"))
      router.refresh()
    } catch (error) {
      console.error("Error starting play session:", error)
      const message = error instanceof Error ? error.message : ""
      toast.error(message || t("sessions.startError"))
    } finally {
      setIsPending(false)
    }
  }

  const handleComplete = async () => {
    if (!socialId || !canComplete) return
    setIsPending(true)
    try {
      await completePlaySession(socialId, session.id)
      toast.success(t("sessions.completeSuccess"))
      router.refresh()
    } catch (error) {
      console.error("Error completing play session:", error)
      const message = error instanceof Error ? error.message : ""
      toast.error(message || t("sessions.completeError"))
    } finally {
      setIsPending(false)
    }
  }

  const currentUserId = sessionData?.user?.id
  const isParticipant = participants.some(
    (p) =>
      p.userId === currentUserId && isActiveSocialParticipantStatus(p.status)
  )
  const canJoin = canJoinPlaySession(
    session.status,
    session.joinedCount,
    session.maxSlot,
    isParticipant
  )
  const canLeave = canLeavePlaySession(session.status, isParticipant)
  const isFull = isFullPlaySession(
    session.status,
    session.joinedCount,
    session.maxSlot,
    isParticipant
  )
  const hasActions = canStart || canComplete || canJoin || canLeave || isFull

  const myParticipant = participants.find((p) => p.userId === currentUserId)
  const totalMatchesCount = matches.length
  const userJoinedMatchesCount = matches.filter((m) => {
    const playerIds = [
      m.team1?.player1?.id,
      m.team1?.player2?.id,
      m.team2?.player1?.id,
      m.team2?.player2?.id,
    ].filter(Boolean)
    return (
      playerIds.includes(currentUserId) ||
      (myParticipant && playerIds.includes(myParticipant.id))
    )
  }).length

  return (
    <div className="space-y-0">
      <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
        <StatCard value={duration} label={t("playSessionOverview.minutes")} />
        <StatCard
          value={getPlaySessionCapacityText(
            session.joinedCount,
            session.maxSlot,
            t("playSessionOverview.unlimited")
          )}
          label={t("playSessionOverview.participants", {})}
        />
        <StatCard
          value={totalMatchesCount}
          label={t("playSessionOverview.totalMatches", {})}
        />
        <StatCard
          value={userJoinedMatchesCount}
          label={t("playSessionOverview.joinedMatches", {})}
        />
      </div>

      <Separator className="my-6" />

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoRow
          icon={<CalendarDays className="size-5" />}
          label={t("playSessionOverview.date")}
          value={format(new Date(session.startTime), "dd/MM/yyyy")}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <InfoRow
          icon={<Clock3 className="size-5" />}
          label={t("playSessionOverview.time")}
          value={`${format(new Date(session.startTime), "h:mm a")} - ${format(new Date(session.endTime), "h:mm a")}`}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <InfoRow
          icon={<MapPin className="size-5" />}
          label={t("playSessionOverview.location")}
          value={session.location || "-"}
          iconClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400"
        />
        {typeof session.sessionFee === "number" && (
          <InfoRow
            icon={<Banknote className="size-5" />}
            label={t("sidebar.payment")}
            value={
              session.sessionFee > 0
                ? formatCurrencyVnd(session.sessionFee)
                : t("form.freeEvent")
            }
            iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
        )}
      </div>

      {hasActions && (
        <>
          <Separator className="my-6" />
          <div className="flex flex-wrap items-center gap-3">
            {canStart && (
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
            {canComplete && (
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

            {canJoin && !isFull && (
              <Button onClick={onJoin} className="gap-2">
                {t("sidebar.joinSession")}
              </Button>
            )}

            {isFull && (
              <Button disabled className="gap-2">
                {t("sidebar.full")}
              </Button>
            )}

            {canLeave && !isHost && (
              <Button variant="destructive" onClick={onLeave} className="gap-2">
                {t("sidebar.leaveSession")}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
