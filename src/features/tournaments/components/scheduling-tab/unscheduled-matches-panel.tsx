"use client"

import { Clock, Loader2, Zap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { TournamentSchedule } from "../../types/schedule"

interface UnscheduledMatchesPanelProps {
  unscheduledMatches: TournamentSchedule[]
  isLoading: boolean
  onMatchClick: (match: TournamentSchedule) => void
  onAutoScheduleClick: () => void
}

function getTeamName(
  team: { name?: string } | string | null | undefined
): string {
  if (!team) return "TBD"
  if (typeof team === "object") return team.name || "TBD"
  return String(team)
}

export function UnscheduledMatchesPanel({
  unscheduledMatches,
  isLoading,
  onMatchClick,
  onAutoScheduleClick,
}: UnscheduledMatchesPanelProps) {
  const { t } = useTournamentTranslation()

  return (
    <div className="flex w-96 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">
          {t("scheduling.unscheduled.title", {
            defaultValue: "Unscheduled Matches",
          })}
        </h2>
        <p className="text-sm text-gray-600">
          {t("scheduling.unscheduled.subtitle", {
            count: unscheduledMatches.length,
            defaultValue: `${unscheduledMatches.length} matches need scheduling`,
          })}
        </p>
      </div>

      <ScrollArea className="min-h-0 flex-1 p-4">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : unscheduledMatches.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-sm text-gray-500">
            <p>
              {t("scheduling.unscheduled.noMatches", {
                defaultValue: "No unscheduled matches found",
              })}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {unscheduledMatches.map((match) => (
              <Card
                key={match.id}
                className="cursor-pointer border-l-4 transition-all hover:bg-gray-50 hover:shadow-md"
                onClick={() => onMatchClick(match)}
              >
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <Badge variant="outline" className="text-xs">
                      {t("scheduling.match.id", {
                        id: match.id,
                        defaultValue: `ID: ${match.id}`,
                      })}
                    </Badge>
                  </div>

                  <div className="mb-1 text-sm font-medium text-gray-900">
                    {getTeamName(match.team1)} vs {getTeamName(match.team2)}
                  </div>
                  <div className="mb-2 text-xs text-gray-600">
                    {match.event}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <Badge variant="outline" className="text-xs">
                      {match.round}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="space-y-2 border-t border-gray-200 bg-gray-50 p-4">
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          onClick={onAutoScheduleClick}
        >
          <Zap className="mr-2 h-4 w-4" />
          {t("scheduling.unscheduled.autoSchedule", {
            defaultValue: "Auto Schedule",
          })}
        </Button>
      </div>
    </div>
  )
}
