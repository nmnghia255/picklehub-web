import { format } from "date-fns"
import { Clock, MapPin, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTeamEventsAction } from "@/features/tournaments/actions/team-actions"
import type { Team } from "@/features/tournaments/types/player"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { AssignedReferee } from "../../../types/referee"

interface RefereeTabProps {
  assignments: AssignedReferee[]
  tournamentId: number
}

export function RefereeTab({ assignments, tournamentId }: RefereeTabProps) {
  const { t } = useTournamentTranslation()
  const router = useRouter()
  const [teamMap, setTeamMap] = useState<Record<string, Team>>({})

  useEffect(() => {
    if (!assignments || assignments.length === 0) return

    // Get unique combinations of tournamentId and eventId
    const uniqueEvents = Array.from(
      new Set(assignments.map((a) => `${a.tournamentId}_${a.eventId}`))
    )

    const fetchAllTeams = async () => {
      const newTeamMap: Record<string, Team> = {}
      await Promise.all(
        uniqueEvents.map(async (key) => {
          const [tournamentId, eventId] = key.split("_")
          if (!tournamentId || !eventId) return
          try {
            const res = await getTeamEventsAction(eventId, tournamentId)
            if (res.success && res.data) {
              res.data.forEach((team: Team) => {
                newTeamMap[String(team.id)] = team
              })
            }
          } catch (err) {
            console.error("Failed to load teams for event:", eventId, err)
          }
        })
      )
      setTeamMap((prev) => ({ ...prev, ...newTeamMap }))
    }

    fetchAllTeams()
  }, [assignments])

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">
          {t("referee.title", { defaultValue: "Referee Assignments" })} (
          {assignments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.length > 0 ? (
            assignments.map((match, index) => {
              const courtName = match.court?.name || `Court ${(index % 4) + 1}`
              const timeStr = match.time || "TBD"
              const eventName = match.event?.name || "Event"
              const isCompleted =
                match.status === "completed" || match.status === "walkover"

              const team1Obj = teamMap[String(match.team1Id)]
              const team2Obj = teamMap[String(match.team2Id)]

              const team1Name = team1Obj
                ? team1Obj.player2
                  ? `${team1Obj.player1.name} / ${team1Obj.player2.name}`
                  : team1Obj.player1.name
                : match.team1Id || "TBD Team 1"

              const team2Name = team2Obj
                ? team2Obj.player2
                  ? `${team2Obj.player1.name} / ${team2Obj.player2.name}`
                  : team2Obj.player1.name
                : match.team2Id || "TBD Team 2"

              return (
                <div
                  key={match.id}
                  className="flex flex-col justify-between gap-4 rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:border-emerald-100 sm:flex-row sm:items-center"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 font-bold text-emerald-700"
                      >
                        {eventName}
                      </Badge>
                      {match.round && (
                        <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                          {match.round}
                        </span>
                      )}
                      <Badge
                        className={`font-semibold ${
                          isCompleted
                            ? "bg-gray-100 text-gray-700"
                            : match.status === "in_progress"
                              ? "animate-pulse bg-blue-100 text-blue-700"
                              : match.status === "ready"
                                ? "border border-emerald-200 bg-emerald-100 text-emerald-700"
                                : match.status === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {match.status === "completed"
                          ? t("referee.statuses.completed", {
                              defaultValue: "completed",
                            })
                          : match.status === "walkover"
                            ? t("referee.statuses.walkover", {
                                defaultValue: "Walkover",
                              })
                            : match.status === "in_progress"
                              ? t("referee.statuses.in_progress", {
                                  defaultValue: "Live",
                                })
                              : match.status === "ready"
                                ? t("referee.statuses.ready", {
                                    defaultValue: "Ready",
                                  })
                                : match.status === "pending"
                                  ? t("referee.statuses.pending", {
                                      defaultValue: "Pending",
                                    })
                                  : t("referee.statuses.scheduled", {
                                      defaultValue: "Scheduled",
                                    })}
                      </Badge>
                    </div>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                      <span>{team1Name}</span>
                      <span className="text-xs font-normal text-gray-400 uppercase">
                        vs
                      </span>
                      <span>{team2Name}</span>
                    </h4>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        {courtName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-emerald-600" />
                        {format(new Date(timeStr), "HH:mm, dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-500">
                          {t("referee.score", { defaultValue: "Score" })}
                        </div>
                        <div className="text-lg font-extrabold text-emerald-700">
                          {match.score || "N/A"}
                        </div>
                      </div>
                    ) : (
                      <Button
                        disabled={
                          match.status !== "ready" &&
                          match.status !== "in_progress"
                        }
                        onClick={() => {
                          router.push(
                            `/score?matchId=${match.externalMatchId}&tournamentId=${tournamentId}&team1=${encodeURIComponent(
                              team1Name
                            )}&team2=${encodeURIComponent(team2Name)}`
                          )
                        }}
                        className="bg-emerald-600 font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Play className="mr-1.5 h-4 w-4 fill-white" />
                        {match.status === "in_progress"
                          ? t("referee.actions.resumeMatch", {
                              defaultValue: "Resume Match",
                            })
                          : match.status === "ready"
                            ? t("referee.actions.startMatch", {
                                defaultValue: "Start Match",
                              })
                            : t("referee.actions.openScoreBoard", {
                                defaultValue: "Open Score Board",
                              })}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-8 text-center text-gray-500">
              {t("referee.noAssignments", {
                defaultValue:
                  "You have no matches assigned for this tournament.",
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
