"use client"

import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  PlayCircle,
} from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { getTournamentFixturesWithScheduleAction } from "../../actions/schedule-actions"
import { useGroupStageStore } from "../../stores/use-group-stage-store"
import type { TournamentSchedule } from "../../types/schedule"

interface GroupStageMatchesProps {
  tournamentId: number
  eventId: number
}

const isKnockoutRound = (roundName: string): boolean => {
  const name = roundName.toLowerCase()
  return (
    name.includes("quarter") ||
    name.includes("semi") ||
    name.includes("final") ||
    name.includes("round of") ||
    name.includes("r32") ||
    name.includes("r16") ||
    name.includes("r8") ||
    name.includes("r4") ||
    name.includes("ko") ||
    name.includes("knockout")
  )
}

function safeExtractFixtures(data: unknown): TournamentSchedule[] {
  if (Array.isArray(data)) {
    return data
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>
    if ("fixtures" in obj && Array.isArray(obj.fixtures)) {
      return obj.fixtures as TournamentSchedule[]
    }
    if ("data" in obj && Array.isArray(obj.data)) {
      return obj.data as TournamentSchedule[]
    }
    for (const key of Object.keys(obj)) {
      const val = obj[key]
      if (Array.isArray(val)) {
        return val as TournamentSchedule[]
      }
    }
  }
  return []
}

export function GroupStageMatches({
  tournamentId,
  eventId,
}: GroupStageMatchesProps) {
  const { t } = useTournamentTranslation()
  const [matches, setMatches] = useState<TournamentSchedule[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isGeneratingMatches = useGroupStageStore((s) => s.isGeneratingMatches)

  useEffect(() => {
    let active = true
    if (!tournamentId || !eventId) return

    const loadMatches = async () => {
      setIsLoading(true)
      try {
        const res = await getTournamentFixturesWithScheduleAction(
          tournamentId,
          {
            eventId,
          }
        )
        if (res.success && res.data && active) {
          const rawFixtures = safeExtractFixtures(res.data)
          const groupMatches = rawFixtures.filter(
            (m) => m.round && !isKnockoutRound(m.round)
          )
          setMatches(groupMatches)
        }
      } catch (err) {
        console.error("Failed to fetch group stage matches:", err)
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadMatches()

    return () => {
      active = false
    }
  }, [tournamentId, eventId, isGeneratingMatches])

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (matches.length === 0) {
    return null // Only display after host generates matches
  }

  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    switch (s) {
      case "completed":
        return (
          <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-400">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            {t("groupStage.completed", { defaultValue: "Completed" })}
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="animate-pulse border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-50 dark:border-blue-950 dark:bg-blue-950/20 dark:text-blue-400">
            <PlayCircle className="mr-1 h-3.5 w-3.5 animate-spin" />
            {t("groupStage.inProgress", { defaultValue: "In Progress" })}
          </Badge>
        )
      case "ready":
        return (
          <Badge className="border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-950 dark:bg-amber-950/20 dark:text-amber-400">
            <Clock className="mr-1 h-3.5 w-3.5" />
            {t("groupStage.ready", { defaultValue: "Ready" })}
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-gray-500">
            {t("groupStage.scheduled", { defaultValue: "Scheduled" })}
          </Badge>
        )
    }
  }

  return (
    <div className="border-gray-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock className="h-6 w-6 text-gray-700" />
        <h2 className="text-xl font-semibold text-gray-900">
          {t("groupStage.scheduledMatchesTitle", {
            defaultValue: "Scheduled Matches",
          })}
        </h2>
      </div>

      {matches.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-0 border-gray-200 bg-white p-12 text-center">
          <h3 className="mb-1 text-lg font-semibold text-gray-950">
            {t("groupStage.noScheduledMatches", {
              defaultValue: "No Schedule Matches Drawn Yet",
            })}
          </h3>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {matches.map((match) => {
            const hasScore =
              match.status.toLowerCase() === "completed" && match.score
            const isT1Winner =
              match.winner === "TEAM_A" ||
              match.winner === "1" ||
              String(match.winner).toLowerCase() === "team_a"
            const isT2Winner =
              match.winner === "TEAM_B" ||
              match.winner === "2" ||
              String(match.winner).toLowerCase() === "team_b"

            return (
              <Card
                key={match.id}
                className="group relative flex flex-col justify-between gap-0 border border-gray-100 bg-white py-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <CardContent className="p-5">
                  {/* Top: Round & Status */}
                  <div className="mb-4 flex items-center justify-between gap-2 border-b border-gray-200 pb-3 dark:border-zinc-800">
                    <span className="text-xs font-black tracking-widest text-gray-600 uppercase">
                      {match.round || "Vòng đấu"}
                    </span>
                    {renderStatusBadge(match.status)}
                  </div>

                  {/* Middle: Teams & Scores */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span
                        className={`line-clamp-1 text-sm ${
                          isT1Winner
                            ? "font-bold text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-zinc-400"
                        }`}
                      >
                        {match.team1?.name || "TBD"}
                      </span>
                      {hasScore && (
                        <span className="font-mono text-sm font-extrabold text-gray-900 dark:text-white">
                          {match.score?.split("-")[0]?.trim() || "0"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span
                        className={`line-clamp-1 text-sm ${
                          isT2Winner
                            ? "font-bold text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-zinc-400"
                        }`}
                      >
                        {match.team2?.name || "TBD"}
                      </span>
                      {hasScore && (
                        <span className="font-mono text-sm font-extrabold text-gray-900 dark:text-white">
                          {match.score?.split("-")[1]?.trim() || "0"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Schedule / Venue Details */}
                  {match.date || match.startTime || match.court ? (
                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-gray-50 pt-4 text-xs text-muted-foreground dark:border-zinc-800">
                      {(match.date || match.startTime) && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                          {match.date}{" "}
                          {match.startTime && `@ ${match.startTime}`}
                        </span>
                      )}
                      {match.court && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          {match.court}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-5 border-t border-gray-50 pt-4 text-xs font-semibold text-gray-400 dark:border-zinc-800">
                      {t("groupStage.unscheduled", {
                        defaultValue: "Unscheduled",
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
