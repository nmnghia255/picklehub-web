"use client"

import { useEffect } from "react"

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
  const {
    teamAName,
    teamBName,
    isSwappedSides,
    handleRallyWin,
    servingTeam,
    serverNumber,
    isDoubles,
    isTimeoutActive,
    timeoutTeam,
    timeoutSecondsLeft,
    startTimeout,
    stopTimeout,
    decrementTimeoutTimer,
  } = useScoreStore()

  // Set up timer effect for timeout countdowns
  useEffect(() => {
    if (!isTimeoutActive) return
    const interval = setInterval(() => {
      decrementTimeoutTimer()
    }, 1000)
    return () => clearInterval(interval)
  }, [isTimeoutActive, decrementTimeoutTimer])

  const displayTeam1Name = isSwappedSides ? teamBName : teamAName
  const team1Color = TEAM_COLOR.A
  const team1Id = isSwappedSides ? "B" : "A"

  const displayTeam2Name = isSwappedSides ? teamAName : teamBName
  const team2Color = TEAM_COLOR.B
  const team2Id = isSwappedSides ? "A" : "B"

  // Consequence helper for Team 1 winning rally
  const getConsequenceText1 = () => {
    if (servingTeam === team1Id) {
      return t("referee.tracker.gainPoint", { defaultValue: "+1" })
    }
    if (!isDoubles) {
      return t("referee.tracker.sideOutConsequence", {
        defaultValue: "Side Out",
      })
    }
    return serverNumber === 1
      ? t("referee.tracker.server2Consequence", { defaultValue: "Server 2" })
      : t("referee.tracker.sideOutConsequence", {
          defaultValue: "Side Out",
        })
  }

  // Consequence helper for Team 2 winning rally
  const getConsequenceText2 = () => {
    if (servingTeam === team2Id) {
      return t("referee.tracker.gainPoint", { defaultValue: "+1" })
    }
    if (!isDoubles) {
      return t("referee.tracker.sideOutConsequence", {
        defaultValue: "Side Out",
      })
    }
    return serverNumber === 1
      ? t("referee.tracker.server2Consequence", { defaultValue: "Server 2" })
      : t("referee.tracker.sideOutConsequence", {
          defaultValue: "Side Out",
        })
  }

  // Render Timeout overlay if active
  if (isTimeoutActive) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-6 text-center shadow-sm dark:bg-amber-950/20">
        <h4 className="animate-pulse text-xs font-black tracking-widest text-amber-800 uppercase dark:text-amber-300">
          {timeoutTeam === "TECHNICAL"
            ? t("referee.tracker.techTimeout", {
                defaultValue: "Technical Timeout",
              })
            : t("referee.tracker.teamTimeout", {
                defaultValue: `Timeout ${timeoutTeam === "A" ? teamAName : teamBName}`,
                name: timeoutTeam === "A" ? teamAName : teamBName,
              })}
        </h4>
        <div className="font-mono text-6xl font-black text-amber-950 tabular-nums dark:text-amber-200">
          {Math.floor(timeoutSecondsLeft / 60)}:
          {(timeoutSecondsLeft % 60).toString().padStart(2, "0")}
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={stopTimeout}
          className="rounded-lg font-bold shadow-xs"
        >
          {t("referee.tracker.endTimeoutBtn", {
            defaultValue: "Resume Match",
          })}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Primary Actions: Award rally winners */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          type="button"
          className={cn(
            "h-auto min-h-20 flex-1 flex-col gap-1.5 rounded-2xl px-6 py-5 shadow-md transition-all active:scale-[0.98]",
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
          <span className="text-lg font-extrabold">
            {t("referee.tracker.rallyWon", {
              team: displayTeam1Name,
              defaultValue: `${displayTeam1Name} wins rally`,
            })}
          </span>
          <span className="rounded-md bg-black/10 px-2 py-0.5 text-xs font-black tracking-wider text-white/80 uppercase">
            {getConsequenceText1()}
          </span>
        </Button>

        <Button
          type="button"
          className={cn(
            "h-auto min-h-20 flex-1 flex-col gap-1.5 rounded-2xl px-6 py-5 shadow-md transition-all active:scale-[0.98]",
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
          <span className="text-lg font-extrabold">
            {t("referee.tracker.rallyWon", {
              team: displayTeam2Name,
              defaultValue: `${displayTeam2Name} wins rally`,
            })}
          </span>
          <span className="rounded-md bg-black/10 px-2 py-0.5 text-xs font-black tracking-wider text-white/80 uppercase">
            {getConsequenceText2()}
          </span>
        </Button>
      </div>

      {/* Secondary Actions: Timeouts & Official calls */}
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-gray-100 bg-gray-50/30 p-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => startTimeout("A")}
          className="border-gray-200 bg-white text-xs font-bold hover:bg-gray-50"
        >
          ⏱️{" "}
          {t("referee.tracker.timeoutTeam", {
            defaultValue: `Timeout ${teamAName}`,
            name: teamAName,
          })}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => startTimeout("B")}
          className="border-gray-200 bg-white text-xs font-bold hover:bg-gray-50"
        >
          ⏱️{" "}
          {t("referee.tracker.timeoutTeam", {
            defaultValue: `Timeout ${teamBName}`,
            name: teamBName,
          })}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => startTimeout("TECHNICAL")}
          className="border-gray-200 bg-white text-xs font-bold hover:bg-gray-50"
        >
          🛠️{" "}
          {t("referee.tracker.timeoutTechnical", {
            defaultValue: "Technical Timeout",
          })}
        </Button>
      </div>
    </div>
  )
}
