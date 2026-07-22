"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useScoreTranslation } from "@/i18n/use-score-translation"
import { cn } from "@/lib/utils"

import { TEAM_COLOR } from "../constants/team-constants"
import { useScoreStore } from "../stores/use-score-store"

export function ScoreBoard() {
  const { t } = useScoreTranslation()
  const {
    teamAName,
    teamBName,
    teamAScore,
    teamBScore,
    servingTeam,
    serverNumber,
    isSwappedSides,
    sets,
    isDoubles,
    gameTarget,
    activeServer,
    playerNames,
    scoreCall,
    setsToWin,
    currentSetId,
  } = useScoreStore()

  const servingScore = servingTeam === "A" ? teamAScore : teamBScore
  const receivingScore = servingTeam === "A" ? teamBScore : teamAScore
  const activeServerName = playerNames[activeServer]

  const leftTeamName = isSwappedSides ? teamBName : teamAName
  const rightTeamName = isSwappedSides ? teamAName : teamBName
  const leftTeamScore = isSwappedSides ? teamBScore : teamAScore
  const rightTeamScore = isSwappedSides ? teamAScore : teamBScore

  const isLeftServing = servingTeam === (isSwappedSides ? "B" : "A")
  const isRightServing = servingTeam === (isSwappedSides ? "A" : "B")

  const leftTeamColor = TEAM_COLOR.A
  const rightTeamColor = TEAM_COLOR.B

  return (
    <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white py-0 shadow-xs">
      <CardContent className="flex flex-col items-center gap-4 p-6">
        <div className="flex w-full items-center justify-between border-b pb-4 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="border-emerald-100 bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-800 hover:bg-emerald-50/80"
            >
              {isDoubles
                ? t("tracker.doubles", { defaultValue: "Doubles" })
                : t("tracker.singles", { defaultValue: "Singles" })}
            </Badge>
            <Badge
              variant="secondary"
              className="border-blue-100 bg-blue-50 px-2.5 py-0.5 font-bold text-blue-800 hover:bg-blue-50/80"
            >
              {setsToWin === 1
                ? t("tracker.bo1", { defaultValue: "BO1" })
                : setsToWin === 2
                  ? t("tracker.bo3", { defaultValue: "BO3" })
                  : setsToWin === 3
                    ? t("tracker.bo5", { defaultValue: "BO5" })
                    : t("tracker.bestOf", {
                        defaultValue: `Best of ${setsToWin * 2 - 1}`,
                        count: setsToWin * 2 - 1,
                      })}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-zinc-400">
            <span>{t("tracker.set", { defaultValue: "Set" })}:</span>
            <Badge
              variant="outline"
              className="h-6 border-gray-300 bg-gray-50 px-2 font-extrabold text-gray-800"
            >
              {currentSetId}
            </Badge>

            <span>
              {t("tracker.targetScore", {
                defaultValue: "Target Score",
              })}
              :
            </span>
            <Badge
              variant="outline"
              className="h-6 border-gray-300 bg-gray-50 px-2 font-extrabold text-gray-800"
            >
              {gameTarget}
            </Badge>
          </div>
        </div>

        <div className="relative flex w-full items-center justify-center rounded-2xl border border-dashed border-gray-200/60 bg-muted/20 py-4">
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <span
              className={cn(
                "mb-2 text-xs font-black tracking-wider uppercase sm:text-sm",
                isLeftServing ? leftTeamColor.score : "text-gray-400"
              )}
            >
              {leftTeamName}
              {isLeftServing && " ♦️"}
            </span>
            <span
              className={cn(
                "text-6xl font-black tracking-tighter tabular-nums sm:text-7xl",
                isLeftServing ? leftTeamColor.score : "text-gray-800"
              )}
            >
              {leftTeamScore}
            </span>
          </div>

          <div className="z-10 flex flex-col items-center justify-center gap-2 px-2">
            <span className="text-3xl font-light text-gray-300">–</span>
            {isDoubles && (
              <Badge className="animate-pulse rounded-md bg-emerald-600 px-2.5 py-1 text-sm font-black text-white shadow-sm hover:bg-emerald-600">
                S{serverNumber}
              </Badge>
            )}
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <span
              className={cn(
                "mb-2 text-xs font-black tracking-wider uppercase sm:text-sm",
                isRightServing ? rightTeamColor.score : "text-gray-400"
              )}
            >
              {rightTeamName}
              {isRightServing && " 🎾"}
            </span>
            <span
              className={cn(
                "text-6xl font-black tracking-tighter tabular-nums sm:text-7xl",
                isRightServing ? rightTeamColor.score : "text-gray-800"
              )}
            >
              {rightTeamScore}
            </span>
          </div>
        </div>

        <div className="mt-2 flex w-full flex-col items-center gap-2 text-center">
          <div className="w-full rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs transition-all dark:border-amber-900/40 dark:bg-amber-950/10">
            <div className="text-xs font-black tracking-widest text-amber-800 uppercase dark:text-amber-400">
              {t("tracker.scoreCallFormat", {
                defaultValue: "Score Call",
              })}
            </div>
            <div className="mt-1 font-mono text-4xl font-extrabold tracking-wider text-amber-950 dark:text-amber-200">
              {scoreCall ||
                (isDoubles
                  ? `${servingScore} - ${receivingScore} - ${serverNumber}`
                  : `${servingScore} - ${receivingScore}`)}
            </div>
          </div>

          <p className="mt-1 w-full text-xs text-gray-500">
            {isDoubles
              ? t("tracker.doublesHelp", {
                  defaultValue: `Call Score: Serving score {{servingScore}} - Receiving score {{receivingScore}} - Server number {{serverNumber}}. {{activeServerName}} is serving.`,
                  servingScore,
                  receivingScore,
                  serverNumber,
                  activeServerName,
                })
              : t("tracker.singlesHelp", {
                  defaultValue: `Call Score: Serving score {{servingScore}} - Receiving score {{receivingScore}}. {{activeServerName}} is serving.`,
                  servingScore,
                  receivingScore,
                  activeServerName,
                })}
          </p>
        </div>

        {sets && sets.length > 0 && (
          <div className="mt-2 flex w-full flex-wrap justify-center gap-2 border-t border-gray-100 pt-4 text-xs font-semibold text-muted-foreground">
            {sets.map((setScore, idx) => (
              <div
                key={idx}
                className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1"
              >
                {t("tracker.setNumber", {
                  number: idx + 1,
                  defaultValue: `Set ${idx + 1}`,
                })}
                :{" "}
                <span className="font-bold text-foreground">
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
