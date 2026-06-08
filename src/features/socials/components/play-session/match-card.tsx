"use client"

import { differenceInMinutes, format } from "date-fns"
import { Edit, ShieldAlert, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Match } from "@/features/socials/mock-data/mockSessionData"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { getMatchStatusClasses } from "../../utils"
import { PlayerRow } from "./player-row"

export default function MatchCard({
  match,
  isHost,
  completed,
}: {
  match: Match
  isHost: boolean
  completed?: boolean
}) {
  const { t } = useSocialsTranslation()

  const getStatusLabel = () => {
    switch (match.status) {
      case "COMPLETED":
        return t("labels.completed")
      case "IN_PROGRESS":
        return t("labels.inProgress")
      default:
        return t("labels.scheduled")
    }
  }

  const getTimingLabel = () => {
    if (completed) {
      return t("matches.completed")
    }

    if (match.status === "IN_PROGRESS") {
      return t("matches.started")
    }

    return t("matches.scheduled")
  }

  return (
    <Card className="p-0">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {t("matches.court", { number: match.courtNumber ?? 0 })}
            </Badge>
            <Badge
              className={getMatchStatusClasses(match.status)}
              variant="outline"
            >
              {getStatusLabel()}
            </Badge>
          </div>
          {match.score && (
            <div className="text-success flex items-center gap-2">
              <Trophy className="size-4" />
              <span className="text-lg font-semibold">
                {match.score.team1Score} - {match.score.team2Score}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
          <div className="space-y-2">
            <PlayerRow user={match.team1.player1} />
            {match.team1.player2 && <PlayerRow user={match.team1.player2} />}
          </div>
          <div className="text-center text-sm font-semibold text-muted-foreground">
            {t("matches.versus")}
          </div>
          <div className="space-y-2 text-right">
            <PlayerRow user={match.team2.player1} alignRight />
            {match.team2.player2 && (
              <PlayerRow user={match.team2.player2} alignRight />
            )}
          </div>
        </div>

        {match.startTime && match.endTime && (
          <p className="text-xs text-muted-foreground">
            {getTimingLabel()} {format(new Date(match.startTime), "h:mm a")}
            {completed &&
              ` • ${t("matches.minutes", {
                count: differenceInMinutes(
                  new Date(match.endTime),
                  new Date(match.startTime)
                ),
              })}`}
          </p>
        )}

        {isHost && (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon">
              <Edit className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
            >
              <ShieldAlert className="size-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
