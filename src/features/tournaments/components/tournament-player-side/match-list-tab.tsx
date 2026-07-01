"use client"

import { BarChart2, CalendarDays, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Match } from "../../types/match"

interface MatchListTabProps {
  type: "live" | "schedule" | "results"
  matches: Match[]
}

export function MatchListTab({ type, matches }: MatchListTabProps) {
  const { t } = useTournamentTranslation()

  if (type === "live") {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            {t("public.tabs.liveScores")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.map((score, index) => (
              <div
                key={index}
                className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm transition-all hover:border-emerald-200"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <Badge className="mb-2 bg-emerald-600 font-bold text-white">
                      {score.court}
                    </Badge>
                    <div className="text-sm font-bold text-gray-900">
                      {score.event}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-emerald-700">
                      {score.score}
                    </div>
                    <Badge
                      className={`mt-1 font-bold ${
                        score.status === "in_progress"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {score.status === "in_progress"
                        ? t("public.liveScores.live")
                        : t("public.liveScores.final")}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 border-t border-gray-50 pt-2 text-sm font-semibold text-gray-700">
                  {typeof score.team1 === "object"
                    ? score.team1?.name
                    : score.team1}{" "}
                  <span className="font-normal text-gray-400">
                    {t("public.liveScores.vs")}
                  </span>{" "}
                  {typeof score.team2 === "object"
                    ? score.team2?.name
                    : score.team2}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === "schedule") {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <CalendarDays className="h-5 w-5 text-emerald-600" />
            {t("public.tabs.schedule")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* {scheduledMatches.map((match, index) => (
              <div
                key={index}
                className="flex flex-col justify-between gap-4 rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:border-emerald-100 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 font-bold text-emerald-700"
                    >
                      {match.event}
                    </Badge>
                    <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                      {match.round}
                    </span>
                  </div>
                  <h4 className="mt-2 text-lg font-bold text-gray-900">
                    {match.match}
                  </h4>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 sm:text-right">
                  <div className="flex flex-col gap-1 sm:items-end">
                    <span className="font-extrabold text-emerald-600">
                      {`Court ${(index % 4) + 1}`}
                    </span>
                    <span className="font-medium text-gray-500">
                      {`Time: ${9 + Math.floor(index / 2)}:${index % 2 === 0 ? "00" : "30"} AM`}
                    </span>
                  </div>
                </div>
              </div>
            ))} */}
          </div>
        </CardContent>
      </Card>
    )
  }

  // results
  const completedMatches = matches.filter((s) => s.status === "completed")

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <BarChart2 className="h-5 w-5 text-emerald-600" />
          {t("public.tabs.results")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {completedMatches.length > 0 ? (
            completedMatches.map((score, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:border-emerald-100"
              >
                <div className="mb-3 flex items-center justify-between border-b border-gray-50 pb-2">
                  <div>
                    <Badge className="bg-emerald-600 font-bold text-white">
                      {score.court}
                    </Badge>
                    <span className="ml-2.5 text-xs font-bold tracking-wider text-gray-500 uppercase">
                      {score.event}
                    </span>
                  </div>
                  <Badge className="border border-emerald-200 bg-emerald-50 font-semibold text-emerald-800">
                    {t("public.liveScores.final")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-base font-bold text-gray-900">
                    {typeof score.team1 === "object"
                      ? score.team1?.name
                      : score.team1}
                    <span className="mx-2 text-xs font-normal text-gray-400">
                      {t("public.liveScores.vs")}
                    </span>
                    {typeof score.team2 === "object"
                      ? score.team2?.name
                      : score.team2}
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-700">
                    {score.score}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              {t("scheduling.noMatchesCompletedYet")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
