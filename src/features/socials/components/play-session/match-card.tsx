"use client"

import { differenceInMinutes, format } from "date-fns"
import { Loader2, Play, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "@/features/auth/hooks/use-session"
import { startMatchAction } from "@/features/socials/actions/suggested-matches"
import type { PlaySessionCardMatch } from "@/features/socials/types/match"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { MatchResultDialog } from "./match-result-dialog"
import { PlayerRow } from "./player-row"

export default function MatchCard({
  match,
  isHost,
  completed,
}: {
  match: PlaySessionCardMatch
  isHost: boolean
  completed?: boolean
}) {
  const { t } = useSocialsTranslation()
  const router = useRouter()
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const session = useSession()

  const handleStartMatch = async () => {
    setIsStarting(true)
    try {
      await startMatchAction(match.id)
      toast.success(t("matches.startSuccess"))
      router.refresh()
    } catch (error) {
      console.error("Error starting match:", error)
      const message = error instanceof Error ? error.message : ""
      toast.error(message || t("matches.startError"))
    } finally {
      setIsStarting(false)
    }
  }

  const currentUserId = session?.user?.id
  const isPlayer = !!(
    currentUserId &&
    (match.team1.player1?.id === currentUserId ||
      match.team1.player2?.id === currentUserId ||
      match.team2.player1?.id === currentUserId ||
      match.team2.player2?.id === currentUserId)
  )
  const isReferee = !!(currentUserId && match.refereeId === currentUserId)
  const canUpdateResult = isPlayer || isReferee || isHost

  const isCompleted =
    !!completed || !!match.winner || !!(match.sets && match.sets.length > 0)
  const isInProgress =
    !isCompleted &&
    (match.status === "LIVE" ||
      match.status === "IN_PROGRESS" ||
      !!match.startedAt)
  const isScheduled = !isCompleted && !isInProgress

  const getTimingText = () => {
    if (isCompleted && match.startTime && match.endTime) {
      const start = format(new Date(match.startTime), "h:mm a")
      const end = format(new Date(match.endTime), "h:mm a")
      const mins = differenceInMinutes(
        new Date(match.endTime),
        new Date(match.startTime)
      )
      return `${start} - ${end} • ${t("matches.minutes", { count: mins })}`
    }

    if (match.startTime) {
      const timeStr = format(new Date(match.startTime), "h:mm a")
      if (isInProgress) {
        return t("matches.startedAt", { time: timeStr })
      }
      return t("matches.scheduledFor", { time: timeStr })
    }

    return ""
  }

  return (
    <Card
      className={`p-0 transition-all ${
        isCompleted
          ? "border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.08)]"
          : isInProgress
            ? "border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.12)]"
            : ""
      }`}
    >
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={
                isCompleted
                  ? "border-emerald-600/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20"
                  : isInProgress
                    ? "border-orange-500/30 bg-orange-50/50 text-orange-500 dark:bg-orange-950/20"
                    : "border-slate-950/20 bg-slate-100 text-slate-950 dark:border-slate-50/20 dark:bg-slate-900/50 dark:text-slate-50"
              }
            >
              {match.courtName ||
                t("matches.court", { number: match.courtNumber ?? 0 })}
            </Badge>
            {isCompleted && (
              <Badge className="border-transparent bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-emerald-600">
                {t("matches.completed").toUpperCase()}
              </Badge>
            )}
            {isInProgress && (
              <Badge className="border-transparent bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-orange-500">
                {t("labels.inProgress").toUpperCase()}
              </Badge>
            )}
            {isScheduled && (
              <Badge className="border-transparent bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-slate-900 dark:bg-slate-50 dark:text-slate-950">
                {t("matches.scheduled").toUpperCase()}
              </Badge>
            )}
          </div>
          {match.score && (
            <div className="flex items-center gap-2">
              <Trophy className="size-4 text-emerald-700" />
              <span className="text-lg font-semibold text-emerald-700">
                {match.score.team1Score} - {match.score.team2Score}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
          <div className="space-y-2">
            {match.team1.player1 && <PlayerRow user={match.team1.player1} />}
            {match.team1.player2 && <PlayerRow user={match.team1.player2} />}
          </div>
          <div className="text-center text-sm font-semibold text-muted-foreground">
            {t("matches.versus")}
          </div>
          <div className="space-y-2 text-right">
            {match.team2.player1 && (
              <PlayerRow user={match.team2.player1} alignRight />
            )}
            {match.team2.player2 && (
              <PlayerRow user={match.team2.player2} alignRight />
            )}
          </div>
        </div>

        {(match.startTime || canUpdateResult) && (
          <div className="flex items-center justify-between gap-4">
            {match.startTime ? (
              <p className="text-sm text-muted-foreground">{getTimingText()}</p>
            ) : (
              <div />
            )}

            {canUpdateResult && (
              <div className="flex items-center gap-2">
                {isScheduled && (
                  <Button
                    size="sm"
                    onClick={handleStartMatch}
                    disabled={isStarting}
                    className="gap-1.5"
                  >
                    {isStarting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Play className="size-3.5 fill-current" />
                    )}
                    {t("matches.startMatch")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResultDialogOpen(true)}
                  disabled={isStarting}
                >
                  {t("matches.fillResult")}
                </Button>
              </div>
            )}
          </div>
        )}

        {isResultDialogOpen && (
          <MatchResultDialog
            key={`${match.id}-${isResultDialogOpen}`}
            match={match}
            open={isResultDialogOpen}
            onOpenChange={setIsResultDialogOpen}
            onSuccess={() => router.refresh()}
          />
        )}
      </CardContent>
    </Card>
  )
}
