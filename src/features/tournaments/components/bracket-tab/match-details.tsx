import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Play,
  Trophy,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Bracket } from "../../types/bracket"

interface MatchDetailsProps {
  match: Bracket
  isHost: boolean
  tournamentId: number
}

export function MatchDetailsContent({
  match,
  isHost,
  tournamentId,
}: MatchDetailsProps) {
  const { t } = useTournamentTranslation()

  const t1 = match.team1
  const t2 = match.team2

  const statusMap = {
    scheduled: {
      label: "brackets.match.statuses.scheduled",
      color: "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-50",
      icon: Clock,
    },
    ready: {
      label: "brackets.match.statuses.ready",
      color: "bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-50",
      icon: Play,
    },
    in_progress: {
      label: "brackets.match.statuses.in_progress",
      color:
        "bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-50 animate-pulse",
      icon: Activity,
    },
    completed: {
      label: "brackets.match.statuses.completed",
      color:
        "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-50",
      icon: CheckCircle2,
    },
    walkover: {
      label: "brackets.match.statuses.walkover",
      color:
        "bg-purple-50 text-purple-700 border-purple-200/80 hover:bg-purple-50",
      icon: AlertTriangle,
    },
  }

  const currentStatus = statusMap[match.status as keyof typeof statusMap] || {
    label: "brackets.match.statuses.scheduled",
    color: "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-50",
    icon: Clock,
  }

  const StatusIcon = currentStatus.icon

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
        <div className="mt-1 text-sm text-gray-600">
          {t("brackets.match.details.seed", { seed: team.seed })} •{" "}
          {t("brackets.match.details.rating", { rating })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="space-y-0.5">
          <span className="block text-sm font-semibold tracking-wider text-gray-400 uppercase">
            {t("brackets.match.details.status")}
          </span>
        </div>
        <Badge
          variant="outline"
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${currentStatus.color}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {t(currentStatus.label, { defaultValue: match.status.toUpperCase() })}
        </Badge>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-gray-900">
          {t("brackets.match.details.participants")}
        </h3>
        <div className="space-y-3">
          <div
            className={`rounded-lg p-3 ${
              match.winner === "team1"
                ? "border border-emerald-200 bg-emerald-50"
                : "bg-gray-100"
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
                : "bg-gray-100"
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

      <div className="space-y-2">
        <h3 className="mb-3 font-semibold text-gray-900">
          {t("brackets.match.details.info")}
        </h3>
        <div className="text-md space-y-2">
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
    </div>
  )
}
