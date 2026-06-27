"use client"

import { Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Bracket } from "../../types/bracket"

interface MatchCardProps {
  match: Bracket
  viewMode: string
  onClick: () => void
}

export function MatchCard({ match, viewMode, onClick }: MatchCardProps) {
  const { t } = useTournamentTranslation()
  const t1 = match.team1
  const t2 = match.team2

  const statusConfig = {
    scheduled: "bg-gray-100 text-gray-700",
    ready: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    completed: "bg-emerald-100 text-emerald-700",
    walkover: "bg-purple-100 text-purple-700",
  }

  const statusColor =
    statusConfig[match.status as keyof typeof statusConfig] ||
    "bg-gray-100 text-gray-600"

  const hasTeams = !!(t1 || t2)

  const renderTeamInfo = (team: typeof t1, winner: boolean) => {
    if (!team) return null
    const name1 =
      team.player1?.name ||
      team.name ||
      t("brackets.match.tbd", { defaultValue: "TBD" })
    const name2 = team.player2?.name
    const showRating = viewMode === "full"
    const rating = team.player1
      ? team.player2
        ? ((team.player1.rating + team.player2.rating) / 2).toFixed(2)
        : team.player1.rating
      : team.rating

    return (
      <div className="min-w-0 flex-1">
        <div
          className={`truncate text-sm ${winner ? "font-bold text-gray-900" : "text-gray-700"}`}
        >
          {name1}
        </div>
        {name2 && (
          <div
            className={`mt-0.5 truncate text-sm ${winner ? "font-bold text-gray-900" : "text-gray-700"}`}
          >
            {name2}
          </div>
        )}
        {showRating && (
          <div className="mt-0.5 font-mono text-[10px] text-gray-500">
            {t("brackets.match.rating", { defaultValue: "Rating" })}: {rating}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card
      className="w-72 cursor-pointer bg-white py-2 transition-all hover:border-emerald-400 hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {hasTeams ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <Badge
                className={`px-2 py-0.5 text-[10px] font-medium ${statusColor}`}
              >
                {t(`brackets.match.statuses.${match.status}`, {
                  defaultValue: match.status.replace("_", " ").toUpperCase(),
                })}
              </Badge>
              {match.score && viewMode !== "compact" && (
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                  {match.score}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {/* Team 1 */}
              <div
                className={`flex items-center justify-between rounded-lg p-2.5 transition-colors ${
                  match.winner === "team1"
                    ? "bg-emerald-50 ring-1 ring-emerald-200"
                    : "bg-gray-50/50"
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100/80 text-[10px] font-bold text-emerald-800">
                    #{t1?.seed ?? "?"}
                  </div>
                  {renderTeamInfo(t1, match.winner === "team1")}
                </div>
                {t1 && match.winner === "team1" && (
                  <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                )}
              </div>

              {/* Team 2 */}
              <div
                className={`flex items-center justify-between rounded-lg p-2.5 transition-colors ${
                  match.winner === "team2"
                    ? "bg-emerald-50 ring-1 ring-emerald-200"
                    : "bg-gray-50/50"
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100/80 text-[10px] font-bold text-emerald-800">
                    #{t2?.seed ?? "?"}
                  </div>
                  {renderTeamInfo(t2, match.winner === "team2")}
                </div>
                {t2 && match.winner === "team2" && (
                  <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded border border-dashed border-gray-100 bg-gray-50/30 py-8 text-center">
            <div className="mb-1 text-sm font-medium text-gray-400">
              {t("brackets.match.tbd", { defaultValue: "TBD" })}
            </div>
            <div className="text-[10px] text-gray-400">
              {t("brackets.match.position", { defaultValue: "Position" })} #
              {match.bracketPosition}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
