"use client"

import {
  BarChart2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Match } from "../../../types/match"

interface MatchListTabProps {
  matches: Match[]
}

export function MatchListTab({ matches }: MatchListTabProps) {
  const { t } = useTournamentTranslation()
  const router = useRouter()

  const renderMatchCard = (
    score: Match,
    index: number,
    status: "live" | "scheduled" | "completed"
  ) => {
    const team1Name =
      typeof score.team1 === "object" && score.team1
        ? score.team1.name
        : String(score.team1 || "TBD")
    const team2Name =
      typeof score.team2 === "object" && score.team2
        ? score.team2.name
        : String(score.team2 || "TBD")

    const t1Players = team1Name.split(/\s*[\/\-&]\s*/).filter(Boolean)
    const t2Players = team2Name.split(/\s*[\/\-&]\s*/).filter(Boolean)

    // Determine winner
    let isTeam1Winner = false
    let isTeam2Winner = false
    if (status === "completed") {
      if (score.winner) {
        isTeam1Winner =
          score.winner === "team1" ||
          String(score.winner) === String(score.team1Id) ||
          (typeof score.team1 === "object" &&
            score.team1 !== null &&
            score.team1.teamId !== undefined &&
            String(score.winner) === String(score.team1.teamId))
        isTeam2Winner =
          score.winner === "team2" ||
          String(score.winner) === String(score.team2Id) ||
          (typeof score.team2 === "object" &&
            score.team2 !== null &&
            score.team2.teamId !== undefined &&
            String(score.winner) === String(score.team2.teamId))
      } else {
        // Fallback: parse score e.g., "11-9"
        const sets = (score.score || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        if (sets.length > 0) {
          let t1Wins = 0
          let t2Wins = 0
          sets.forEach((set) => {
            const parts = set.split("-")
            const s1 = parseInt(parts[0]?.trim() || "0", 10)
            const s2 = parseInt(parts[1]?.trim() || "0", 10)
            if (s1 > s2) t1Wins++
            if (s2 > s1) t2Wins++
          })
          isTeam1Winner = t1Wins > t2Wins
          isTeam2Winner = t2Wins > t1Wins
        }
      }
    }

    // Parse set scores
    const sets = (score.score || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const parsedSets = sets.map((set) => {
      const parts = set.split("-")
      return {
        s1: parts[0]?.trim() || "0",
        s2: parts[1]?.trim() || "0",
      }
    })

    const courtName = score.court || `Court ${(index % 4) + 1}`
    const timeStr =
      score.time ||
      `${9 + Math.floor(index / 2)}:${index % 2 === 0 ? "00" : "30"} AM`

    const isLive = status === "live"
    return (
      <div
        key={index}
        onClick={
          isLive
            ? () => {
                const targetMatchId = score.externalMatchId || score.id
                router.push(
                  `/score?matchId=${targetMatchId}&tournamentId=${score.tournamentId || ""}&team1=${encodeURIComponent(
                    team1Name
                  )}&team2=${encodeURIComponent(team2Name)}&mode=view`
                )
              }
            : undefined
        }
        className={`rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 ${
          isLive
            ? "cursor-pointer hover:border-red-200 hover:bg-gray-50/80"
            : "hover:border-emerald-100"
        }`}
      >
        {/* Match Header */}
        <div className="mb-3 flex items-center justify-between border-b border-gray-50 pb-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 font-bold text-white">
              {courtName}
            </Badge>
            <span className="ml-2.5 text-xs font-bold tracking-wider text-gray-500 uppercase">
              {score.round || score.event}
            </span>
          </div>

          {/* Status Badge on the right */}
          {status === "live" && (
            <Badge className="animate-pulse border-none bg-red-500 font-bold text-white">
              {t("public.liveScores.live")}
            </Badge>
          )}
          {status === "completed" && (
            <Badge className="border border-emerald-200 bg-emerald-50 font-semibold text-emerald-800">
              {t("public.liveScores.final")}
            </Badge>
          )}
          {status === "scheduled" && (
            <span className="text-xs font-semibold text-gray-500">
              {timeStr}
            </span>
          )}
        </div>

        {/* Teams and Scores */}
        <div className="flex flex-col gap-4">
          {/* Team 1 Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                {t1Players.map((name, i) => (
                  <Avatar
                    key={i}
                    className="h-8 w-8 border-2 border-white ring-1 ring-gray-100"
                  >
                    <AvatarFallback className="bg-emerald-50 text-[10px] font-bold text-emerald-700">
                      {name.trim().substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="flex flex-col">
                {t1Players.map((name, i) => (
                  <span
                    key={i}
                    className={`text-sm leading-tight font-semibold text-gray-900 ${
                      status === "completed" && isTeam1Winner
                        ? "font-bold text-gray-900"
                        : "font-medium text-gray-600"
                    }`}
                  >
                    {name.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Team 1 Score Box */}
            {status !== "scheduled" && (
              <div className="flex gap-1.5">
                {parsedSets.length > 0 ? (
                  parsedSets.map((set, i) => (
                    <div
                      key={i}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold ${
                        status === "completed" && isTeam1Winner
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : status === "live"
                            ? "border border-red-200 bg-red-50 text-red-700"
                            : "border-gray-150 border bg-gray-50 text-gray-400"
                      }`}
                    >
                      {set.s1}
                    </div>
                  ))
                ) : (
                  <div className="border-gray-150 flex h-8 w-8 items-center justify-center rounded-lg border bg-gray-50 text-sm font-extrabold text-gray-400">
                    0
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Team 2 Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                {t2Players.map((name, i) => (
                  <Avatar
                    key={i}
                    className="h-8 w-8 border-2 border-white ring-1 ring-gray-100"
                  >
                    <AvatarFallback className="bg-emerald-50 text-[10px] font-bold text-emerald-700">
                      {name.trim().substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="flex flex-col">
                {t2Players.map((name, i) => (
                  <span
                    key={i}
                    className={`text-sm leading-tight font-semibold text-gray-900 ${
                      status === "completed" && isTeam2Winner
                        ? "font-bold text-gray-900"
                        : "font-medium text-gray-600"
                    }`}
                  >
                    {name.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Team 2 Score Box */}
            {status !== "scheduled" && (
              <div className="flex gap-1.5">
                {parsedSets.length > 0 ? (
                  parsedSets.map((set, i) => (
                    <div
                      key={i}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold ${
                        status === "completed" && isTeam2Winner
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : status === "live"
                            ? "border border-red-200 bg-red-50 text-red-700"
                            : "border-gray-150 border bg-gray-50 text-gray-400"
                      }`}
                    >
                      {set.s2}
                    </div>
                  ))
                ) : (
                  <div className="border-gray-150 flex h-8 w-8 items-center justify-center rounded-lg border bg-gray-50 text-sm font-extrabold text-gray-400">
                    0
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const [isLiveExpanded, setIsLiveExpanded] = useState(true)
  const [isScheduledExpanded, setIsScheduledExpanded] = useState(true)
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true)

  const liveMatches = matches.filter((m) => m.status === "in_progress")
  const scheduledMatches = matches.filter(
    (m) => m.status !== "completed" && m.status !== "in_progress"
  )
  const completedMatches = matches.filter((m) => m.status === "completed")

  return (
    <div className="space-y-6">
      {/* Live Matches Section */}
      <Card className="gap-0 overflow-hidden border-gray-200 shadow-sm">
        <div
          onClick={() => setIsLiveExpanded(!isLiveExpanded)}
          className="flex cursor-pointer items-center justify-between p-5 transition-colors select-none hover:bg-gray-50/50"
        >
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
            <h3 className="text-xl font-bold text-gray-900">
              {t("public.tabs.liveScores")}
            </h3>
          </div>
          {isLiveExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </div>
        {isLiveExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              {liveMatches.length > 0 ? (
                liveMatches.map((score, index) =>
                  renderMatchCard(score, index, "live")
                )
              ) : (
                <div className="border-gray-150 rounded-lg border border-dashed bg-gray-50/30 py-6 text-center text-sm text-gray-500">
                  {t("public.noMatches", { defaultValue: "No matches" })}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Upcoming Matches Section */}
      <Card className="gap-0 overflow-hidden border-gray-200 shadow-sm">
        <div
          onClick={() => setIsScheduledExpanded(!isScheduledExpanded)}
          className="flex cursor-pointer items-center justify-between p-5 transition-colors select-none hover:bg-gray-50/50"
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-emerald-600" />
            <h3 className="text-xl font-bold text-gray-900">
              {t("public.upcomingMatches", {
                defaultValue: "Upcoming Matches",
              })}
            </h3>
          </div>
          {isScheduledExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </div>
        {isScheduledExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              {scheduledMatches.length > 0 ? (
                scheduledMatches.map((match, index) =>
                  renderMatchCard(match, index, "scheduled")
                )
              ) : (
                <div className="border-gray-150 rounded-lg border border-dashed bg-gray-50/30 py-6 text-center text-sm text-gray-500">
                  {t("public.noMatches", { defaultValue: "No matches" })}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Finished Matches Section */}
      <Card className="gap-0 overflow-hidden border-gray-200 shadow-sm">
        <div
          onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
          className="flex cursor-pointer items-center justify-between p-5 transition-colors select-none hover:bg-gray-50/50"
        >
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-emerald-600" />
            <h3 className="text-xl font-bold text-gray-900">
              {t("public.finishedMatches", {
                defaultValue: "Finished Matches",
              })}
            </h3>
          </div>
          {isCompletedExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </div>
        {isCompletedExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              {completedMatches.length > 0 ? (
                completedMatches.map((score, index) =>
                  renderMatchCard(score, index, "completed")
                )
              ) : (
                <div className="border-gray-150 rounded-lg border border-dashed bg-gray-50/30 py-6 text-center text-sm text-gray-500">
                  {t("public.noMatches", { defaultValue: "No matches" })}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
