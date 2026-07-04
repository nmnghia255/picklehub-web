"use client"

import { Button } from "@/components/ui/button"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import { TEAM_COLOR } from "../constants/team-constants"
import { useScoreStore } from "../stores/use-score-store"

type ScoreControlsProps = {
  isMatchServiceMatch: boolean
  matchId: string | null
}

export function ScoreControls({
  isMatchServiceMatch,
  matchId,
}: ScoreControlsProps) {
  const { t } = useTournamentTranslation()
  const { teamAName, teamBName, isSwappedSides, handleRallyWin } =
    useScoreStore()

  const displayTeam1Name = isSwappedSides ? teamBName : teamAName
  const team1Color = isSwappedSides ? TEAM_COLOR.B : TEAM_COLOR.A

  const displayTeam2Name = isSwappedSides ? teamAName : teamBName
  const team2Color = isSwappedSides ? TEAM_COLOR.A : TEAM_COLOR.B

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Button
        type="button"
        className={cn(
          "h-auto min-h-16 flex-1 flex-col gap-1 rounded-none py-5 text-base",
          team1Color.actionButton
        )}
        onClick={() =>
          handleRallyWin(
            isSwappedSides ? "B" : "A",
            isMatchServiceMatch,
            matchId
          )
        }
      >
        {t("referee.tracker.rallyWon", {
          team: displayTeam1Name,
          defaultValue: `${displayTeam1Name} thắng pha`,
        })}
      </Button>

      <Button
        type="button"
        className={cn(
          "h-auto min-h-16 flex-1 flex-col gap-1 rounded-none py-5 text-base",
          team2Color.actionButton
        )}
        onClick={() =>
          handleRallyWin(
            isSwappedSides ? "A" : "B",
            isMatchServiceMatch,
            matchId
          )
        }
      >
        {t("referee.tracker.rallyWon", {
          team: displayTeam2Name,
          defaultValue: `${displayTeam2Name} thắng pha`,
        })}
      </Button>
    </div>
  )
}
