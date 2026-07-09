"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import { TEAM_COLOR } from "../constants/team-constants"
import { useScoreStore } from "../stores/use-score-store"

export function ScoreBoard() {
  const { t } = useTournamentTranslation()
  const {
    teamAName,
    teamBName,
    teamAScore,
    teamBScore,
    servingTeam,
    serverNumber,
    isSwappedSides,
    sets,
  } = useScoreStore()

  const displayTeam1Name = isSwappedSides ? teamBName : teamAName
  const displayTeam1Score = isSwappedSides ? teamBScore : teamAScore
  const isTeam1Serving = servingTeam === (isSwappedSides ? "B" : "A")
  const team1Color = isSwappedSides ? TEAM_COLOR.B : TEAM_COLOR.A

  const displayTeam2Name = isSwappedSides ? teamAName : teamBName
  const displayTeam2Score = isSwappedSides ? teamAScore : teamBScore
  const isTeam2Serving = servingTeam === (isSwappedSides ? "A" : "B")
  const team2Color = isSwappedSides ? TEAM_COLOR.A : TEAM_COLOR.B

  const scoreServing = servingTeam === "A" ? teamAScore : teamBScore
  const scoreReceiving = servingTeam === "A" ? teamBScore : teamAScore

  return (
    <Card className="rounded-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-base">{t("referee.score")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="flex w-full items-center justify-center gap-6">
          <div className="flex min-w-0 flex-1 flex-col items-center">
            <div className="w-full px-2 text-center text-xs font-semibold wrap-break-word text-muted-foreground sm:text-sm">
              {displayTeam1Name}
            </div>
            <div
              className={cn(
                "mt-1 text-5xl font-bold tabular-nums sm:text-6xl",
                isTeam1Serving && team1Color.score
              )}
            >
              {displayTeam1Score}
            </div>
          </div>
          <span className="mt-6 text-2xl text-muted-foreground" aria-hidden>
            –
          </span>
          <div className="flex min-w-0 flex-1 flex-col items-center">
            <div className="w-full px-2 text-center text-xs font-semibold wrap-break-word text-muted-foreground sm:text-sm">
              {displayTeam2Name}
            </div>
            <div
              className={cn(
                "mt-1 text-5xl font-bold tabular-nums sm:text-6xl",
                isTeam2Serving && team2Color.score
              )}
            >
              {displayTeam2Score}
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 py-1.5 pr-2 pl-4 text-sm">
          <span className="text-muted-foreground">
            {t("referee.tracker.servingTurn")}
          </span>
          <Badge variant="default">
            {t("referee.tracker.serverBadge", {
              number: serverNumber,
            })}
          </Badge>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {t("referee.tracker.scoreCallFormat")}
          </span>
          {`${scoreServing} - ${scoreReceiving} - ${serverNumber}`}
          <span className="sr-only">
            {t("referee.tracker.scoreCallFormatHelp", {
              number: serverNumber,
            })}
          </span>
        </p>

        {/* Completed sets display */}
        {sets && sets.length > 0 && (
          <div className="mt-2 flex w-full flex-wrap justify-center gap-2 border-t pt-3 text-xs font-semibold text-muted-foreground">
            {sets.map((setScore, idx) => (
              <div key={idx} className="rounded-md border bg-muted px-2.5 py-1">
                {t("referee.tracker.setLabel", { setNumber: idx + 1 })}{" "}
                <span className="text-foreground">
                  {setScore[0]} – {setScore[1]}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
