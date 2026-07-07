"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
    isDoubles,
    gameTarget,
    setGameTarget,
    activeServer,
    playerNames,
  } = useScoreStore()

  const servingScore = servingTeam === "A" ? teamAScore : teamBScore
  const receivingScore = servingTeam === "A" ? teamBScore : teamAScore

  const activeServerName = playerNames[activeServer]

  // Configured names mapped to physical sides
  const leftTeamName = isSwappedSides ? teamBName : teamAName
  const rightTeamName = isSwappedSides ? teamAName : teamBName
  const leftTeamScore = isSwappedSides ? teamBScore : teamAScore
  const rightTeamScore = isSwappedSides ? teamAScore : teamBScore

  const isLeftServing = servingTeam === (isSwappedSides ? "B" : "A")
  const isRightServing = servingTeam === (isSwappedSides ? "A" : "B")

  const leftTeamColor = isSwappedSides ? TEAM_COLOR.B : TEAM_COLOR.A
  const rightTeamColor = isSwappedSides ? TEAM_COLOR.A : TEAM_COLOR.B

  return (
    <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
      <CardContent className="flex flex-col items-center gap-4 p-6">
        {/* Top bar: Format details & Target score selector */}
        <div className="flex w-full items-center justify-between border-b pb-4 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="border-emerald-100 bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-800 hover:bg-emerald-50/80"
            >
              {isDoubles ? "Doubles (Đánh đôi)" : "Singles (Đánh đơn)"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span>
              {t("referee.tracker.targetScore", {
                defaultValue: "Điểm mục tiêu",
              })}
              :
            </span>
            <Select
              value={String(gameTarget)}
              onValueChange={(val) => setGameTarget(Number(val))}
            >
              <SelectTrigger className="h-7 w-20 border-gray-200 bg-white text-xs">
                <SelectValue placeholder="11" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="11">11</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="21">21</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Large Centered Score Callout */}
        <div className="relative flex w-full items-center justify-center rounded-2xl border border-dashed border-gray-200/60 bg-muted/20 py-4">
          {/* Left Team block */}
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <span
              className={cn(
                "mb-2 text-xs font-black tracking-wider uppercase sm:text-sm",
                isLeftServing ? leftTeamColor.score : "text-gray-400"
              )}
            >
              {leftTeamName}
              {isLeftServing && " 🎾"}
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

          {/* Center Divider/Server Indicator */}
          <div className="z-10 flex flex-col items-center justify-center gap-2 px-2">
            <span className="text-3xl font-light text-gray-300">–</span>
            {isDoubles && (
              <Badge className="animate-pulse rounded-md bg-emerald-600 px-2.5 py-1 text-sm font-black text-white shadow-sm hover:bg-emerald-600">
                S{serverNumber}
              </Badge>
            )}
          </div>

          {/* Right Team block */}
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

        {/* Scoreboard Metadata & Call Announcement Helper */}
        <div className="mt-2 flex w-full flex-col items-center gap-2 text-center">
          <div className="text-xs font-black tracking-widest text-gray-500 uppercase">
            {t("referee.tracker.scoreCallFormat", {
              defaultValue: "Cách gọi tỷ số (Announce)",
            })}
          </div>

          <div className="font-mono text-2xl font-black tracking-wider text-neutral-800">
            {isDoubles
              ? `${servingScore} - ${receivingScore} - ${serverNumber}`
              : `${servingScore} - ${receivingScore}`}
          </div>

          <p className="mt-1 max-w-md text-xs text-gray-500">
            {isDoubles
              ? t("referee.tracker.doublesHelp", {
                  defaultValue: `Đọc: Điểm giao (${servingScore}) - Điểm nhận (${receivingScore}) - Trọng tài thứ (${serverNumber}). Hiện tại ${activeServerName} đang giao bóng.`,
                  serving: servingScore,
                  receiving: receivingScore,
                  server: serverNumber,
                  name: activeServerName,
                })
              : t("referee.tracker.singlesHelp", {
                  defaultValue: `Đọc: Điểm giao (${servingScore}) - Điểm nhận (${receivingScore}). Hiện tại ${activeServerName} đang giao bóng.`,
                  serving: servingScore,
                  receiving: receivingScore,
                  name: activeServerName,
                })}
          </p>
        </div>

        {/* Completed sets display */}
        {sets && sets.length > 0 && (
          <div className="mt-2 flex w-full flex-wrap justify-center gap-2 border-t border-gray-100 pt-4 text-xs font-semibold text-muted-foreground">
            {sets.map((setScore, idx) => (
              <div
                key={idx}
                className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1"
              >
                Set {idx + 1}:{" "}
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
