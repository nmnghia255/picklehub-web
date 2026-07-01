"use client"

import { Clock, MapPin, Play, Trophy } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { AssignedReferee } from "../../types/referee"
import { RefereeScoring } from "../referee-scoring"

interface RefereeTabProps {
  assignments: AssignedReferee[]
  onRefresh?: () => void
}

export function RefereeTab({ assignments, onRefresh }: RefereeTabProps) {
  const { t } = useTournamentTranslation()
  const [selectedMatch, setSelectedMatch] = useState<AssignedReferee | null>(
    null
  )

  const handleCloseScoring = () => {
    setSelectedMatch(null)
    onRefresh?.()
  }

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
              const isCompleted = match.status === "completed"

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
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {isCompleted
                          ? t("public.liveScores.final", {
                              defaultValue: "Final",
                            })
                          : match.status === "in_progress"
                            ? t("public.liveScores.live", {
                                defaultValue: "Live",
                              })
                            : t("scheduling.status.scheduled", {
                                defaultValue: "Scheduled",
                              })}
                      </Badge>
                    </div>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                      <span>{match.team1Id || "TBD Team 1"}</span>
                      <span className="text-xs font-normal text-gray-400 uppercase">
                        vs
                      </span>
                      <span>{match.team2Id || "TBD Team 2"}</span>
                    </h4>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        {courtName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-emerald-600" />
                        {timeStr}
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
                        onClick={() => setSelectedMatch(match)}
                        className="bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                      >
                        <Play className="mr-1.5 h-4 w-4 fill-white" />
                        {t("referee.actions.startScoring", {
                          defaultValue: "Enter Score",
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

      {/* Scorekeeping Dialog */}
      {selectedMatch && (
        <Dialog
          open={!!selectedMatch}
          onOpenChange={(open) => !open && handleCloseScoring()}
        >
          <DialogContent className="max-w-4xl overflow-hidden border-none bg-gray-50 p-0">
            <RefereeScoring
              match={selectedMatch}
              onClose={handleCloseScoring}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
