"use client"

import { AlertTriangle, Calendar, Clock, MapPin, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Bracket } from "../../types/bracket"

interface MatchDetailsProps {
  match: Bracket
}

export function MatchDetailsContent({ match }: MatchDetailsProps) {
  const { t } = useTournamentTranslation()
  const t1 = match.team1
  const t2 = match.team2

  const statusMap = {
    scheduled: {
      label: "brackets.match.statuses.scheduled",
      color: "bg-gray-100 text-gray-700",
    },
    ready: {
      label: "brackets.match.statuses.ready",
      color: "bg-blue-100 text-blue-700",
    },
    in_progress: {
      label: "brackets.match.statuses.in_progress",
      color: "bg-yellow-100 text-yellow-700",
    },
    completed: {
      label: "brackets.match.statuses.completed",
      color: "bg-emerald-100 text-emerald-700",
    },
    walkover: {
      label: "brackets.match.statuses.walkover",
      color: "bg-purple-100 text-purple-700",
    },
  }

  const currentStatus = statusMap[match.status as keyof typeof statusMap] || {
    label: "brackets.match.statuses.scheduled",
    color: "bg-gray-100 text-gray-700",
  }

  const renderTeamDetails = (team: typeof t1, isWinner: boolean) => {
    if (!team) {
      return (
        <div className="font-medium text-gray-900">
          {t("brackets.match.tbd", { defaultValue: "TBD" })}
        </div>
      )
    }

    const name1 =
      team.player1?.name ||
      team.name ||
      t("brackets.match.tbd", { defaultValue: "TBD" })
    const name2 = team.player2?.name
    const rating = team.player1
      ? team.player2
        ? ((team.player1.rating + team.player2.rating) / 2).toFixed(2)
        : team.player1.rating
      : team.rating

    return (
      <div>
        <div
          className={`font-medium ${
            isWinner ? "font-bold text-emerald-950" : "text-gray-900"
          }`}
        >
          {name1}
        </div>
        {name2 && (
          <div
            className={`mt-0.5 font-medium ${
              isWinner ? "font-bold text-emerald-950" : "text-gray-900"
            }`}
          >
            {name2}
          </div>
        )}
        <div className="mt-1 text-xs text-gray-600">
          {t("brackets.match.details.seed", { seed: team.seed })} •{" "}
          {t("brackets.match.details.rating", { rating })}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="mb-2 text-sm font-medium text-gray-500">
          {t("brackets.match.details.status")}
        </div>
        <Badge className={currentStatus.color}>
          {t(currentStatus.label, { defaultValue: match.status.toUpperCase() })}
        </Badge>
      </div>

      <div>
        <h4 className="mb-3 font-semibold text-gray-900">
          {t("brackets.match.details.participants")}
        </h4>
        <div className="space-y-3">
          <div
            className={`rounded-lg p-3 ${
              match.winner === "team1"
                ? "border border-emerald-200 bg-emerald-50"
                : "bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              {renderTeamDetails(t1, match.winner === "team1")}
              {match.winner === "team1" && (
                <Trophy className="h-5 w-5 text-amber-500" />
              )}
            </div>
          </div>

          <div
            className={`rounded-lg p-3 ${
              match.winner === "team2"
                ? "border border-emerald-200 bg-emerald-50"
                : "bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              {renderTeamDetails(t2, match.winner === "team2")}
              {match.winner === "team2" && (
                <Trophy className="h-5 w-5 text-amber-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {match.score && (
        <div>
          <h4 className="mb-2 font-semibold text-gray-900">
            {t("brackets.match.details.score", { defaultValue: "Match Score" })}
          </h4>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4 text-center">
            <span className="font-mono text-xl font-bold text-emerald-700">
              {match.score}
            </span>
          </div>
        </div>
      )}

      <div>
        <h4 className="mb-3 font-semibold text-gray-900">
          {t("brackets.match.details.info")}
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {t("brackets.match.details.court")}
            </span>
            <span className="font-medium text-gray-900">
              {t("brackets.match.details.tbd", { defaultValue: "TBD" })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {t("brackets.match.details.time")}
            </span>
            <span className="font-medium text-gray-900">
              {t("brackets.match.details.tbd", { defaultValue: "TBD" })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {t("brackets.match.details.round")}
            </span>
            <span className="font-medium text-gray-900">
              {t(`brackets.match.rounds.${match.round}`, {
                defaultValue: match.round,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t pt-4">
        <h4 className="mb-3 font-semibold text-gray-900">
          {t("brackets.match.details.actions")}
        </h4>
        <Button variant="outline" className="w-full justify-start" disabled>
          {t("brackets.match.details.editMatch")}
        </Button>
        <Button variant="outline" className="w-full justify-start" disabled>
          {t("brackets.match.details.reassignCourt")}
        </Button>
        <Button variant="outline" className="w-full justify-start" disabled>
          {t("brackets.match.details.updateScore")}
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-yellow-600 hover:text-yellow-700"
          disabled
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          {t("brackets.match.details.markWalkover")}
        </Button>
      </div>
    </div>
  )
}
