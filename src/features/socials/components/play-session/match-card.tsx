"use client"

import { format } from "date-fns"
import { Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "@/features/auth/hooks/use-session"
import type { PlaySessionCardMatch } from "@/features/socials/types/match"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { MatchResultDialog } from "./match-result-dialog"
import { PlayerRow } from "./player-row"

export default function MatchCard({
  match,
  isHost,
  completed,
  isRoundStarted = true,
  onResultSuccess,
}: {
  match: PlaySessionCardMatch
  isHost: boolean
  completed?: boolean
  isRoundStarted?: boolean
  onResultSuccess?: () => void
}) {
  const { t } = useSocialsTranslation()
  const router = useRouter()
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)
  const session = useSession()

  const currentUserId = session?.user?.id
  const isPlayer = !!(
    currentUserId &&
    (match.team1?.player1?.id === currentUserId ||
      match.team1?.player2?.id === currentUserId ||
      match.team2?.player1?.id === currentUserId ||
      match.team2?.player2?.id === currentUserId)
  )
  const isReferee = !!(currentUserId && match.refereeId === currentUserId)
  const canUpdateResult = isPlayer || isReferee || isHost

  const isConfirmed = match.status === "CONFIRMED"
  const isCompleted =
    !!completed || !!match.winner || !!(match.sets && match.sets.length > 0)
  const isInProgress =
    !isCompleted &&
    (match.status === "LIVE" ||
      match.status === "IN_PROGRESS" ||
      !!match.startedAt)
  const isScheduled = !isCompleted && !isInProgress

  const getTimingText = () => {
    const startTimeValue =
      match.startTime || match.startedAt || match.scheduledAt

    if (!startTimeValue) return ""

    const start = format(new Date(startTimeValue), "HH:mm")
    return `${t("matches.startedAt", { time: start })}`
  }

  const hasTiming = Boolean(
    match.startTime || match.startedAt || match.scheduledAt
  )

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
          <div className="flex flex-wrap items-center gap-2.5">
            {match.matchLabel && (
              <span className="text-base font-extrabold tracking-wide text-foreground uppercase">
                {match.matchLabel}
              </span>
            )}
            {match.matchLabel &&
              (isCompleted || isInProgress || isScheduled) && (
                <span className="font-semibold text-muted-foreground">—</span>
              )}
            {isCompleted && (
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-50/50 text-[10px] font-semibold text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-950/20"
              >
                {t("matches.completed")}
              </Badge>
            )}
            {isInProgress && (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-50/50 text-[10px] font-semibold text-amber-600 dark:border-amber-400/30 dark:bg-amber-950/20"
              >
                {t("labels.inProgress")}
              </Badge>
            )}
            {isScheduled && (
              <Badge
                variant="outline"
                className="border-sky-500/30 bg-sky-50/50 text-[10px] font-semibold text-sky-600 dark:border-sky-400/30 dark:bg-sky-950/20"
              >
                {t("matches.scheduled")}
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

        {(hasTiming ||
          match.courtName ||
          (canUpdateResult && (isScheduled || isInProgress))) && (
          <div className="flex items-center justify-between gap-4 border-t pt-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {(match.courtName || match.courtNumber) && (
                <Badge
                  variant="outline"
                  className="border-slate-300 bg-slate-100 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200"
                >
                  {match.courtName ||
                    t("matches.court", { number: match.courtNumber ?? 0 })}
                </Badge>
              )}
              {match.startTime && <span>{getTimingText()}</span>}
            </div>

            {canUpdateResult && isRoundStarted && !isConfirmed && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResultDialogOpen(true)}
                >
                  {isCompleted
                    ? t("matches.updateResult", "Cập Nhật Tỷ Số")
                    : t("matches.fillResult", "Nhập Tỷ Số")}
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
            onSuccess={() => {
              if (onResultSuccess) onResultSuccess()
              router.refresh()
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
