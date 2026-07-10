"use client"

import { Clock, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Team, TournamentSchedule } from "../../types/schedule"

interface ReadyMatchesCardProps {
  readyMatches: TournamentSchedule[]
  isLoading: boolean
}

function getTeamName(team: Team | null | undefined): string {
  if (!team) return "TBD"
  return team.name
}

export function ReadyMatchesCard({
  readyMatches,
  isLoading,
}: ReadyMatchesCardProps) {
  const { t } = useTournamentTranslation()

  return (
    <Card className="gap-0 border-gray-200 pb-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-800">
          <Clock className="h-4 w-4 text-blue-500" />
          {t("liveControl.readyMatches.titleWithCount", {
            count: readyMatches.length,
            defaultValue: `Ready Matches (${readyMatches.length})`,
          })}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-72">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : readyMatches.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              {t("liveControl.readyMatches.noMatches", {
                defaultValue: "No ready matches",
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {readyMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-start gap-3 rounded-lg border bg-gray-50/50 p-3 text-sm shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50 text-[10px] font-medium text-blue-700"
                      >
                        {match.court ||
                          t("liveControl.matchQueue.noCourt", {
                            defaultValue: "No Court",
                          })}
                      </Badge>
                      <span className="flex items-center gap-0.5 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {match.startTime ||
                          t("liveControl.readyMatches.tbd", {
                            defaultValue: "TBD",
                          })}
                      </span>
                    </div>
                    <div className="mb-1 truncate font-semibold text-gray-900">
                      {getTeamName(match.team1)}{" "}
                      {t("liveControl.liveMatches.vs", { defaultValue: "vs" })}{" "}
                      {getTeamName(match.team2)}
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      {match.event} • {match.round}
                    </div>
                  </div>
                  <Badge className="self-center border-none bg-blue-100 font-medium text-blue-800 capitalize">
                    {t(`liveControl.readyMatches.${match.status}`, {
                      defaultValue: match.status,
                    })}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
