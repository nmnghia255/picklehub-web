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
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useBracketStore } from "../../stores/use-bracket-store"
import type { Bracket, Team } from "../../types/bracket"

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
  const editBracket = useBracketStore((s) => s.editBracket)
  const isLocked = useBracketStore((s) => s.isLocked)
  const selectedEventId = useBracketStore((s) => s.selectedEventId)
  const brackets = useBracketStore((s) => s.brackets)

  const [isEditing, setIsEditing] = useState(false)
  const [selectedTeam1Id, setSelectedTeam1Id] = useState<string>(
    match.team1?.teamId?.toString() || "none"
  )
  const [selectedTeam2Id, setSelectedTeam2Id] = useState<string>(
    match.team2?.teamId?.toString() || "none"
  )

  // Get all unique teams from the current bracket
  const allTeams = Array.from(
    new Map(
      brackets
        .flatMap((b) => [b.team1, b.team2])
        .filter((t): t is Team => t !== null && t !== undefined)
        .map((t) => [t.teamId, t])
    ).values()
  ).sort((a, b) => a.seed - b.seed)

  const handleSaveEdit = async () => {
    if (!selectedEventId) return
    const successMsg = t("brackets.match.editSuccess", {
      defaultValue: "Matchup updated successfully!",
    })
    const errorMsg = t("brackets.match.editError", {
      defaultValue: "Failed to update matchup",
    })

    const t1Id = selectedTeam1Id === "none" ? 0 : Number(selectedTeam1Id)
    const t2Id = selectedTeam2Id === "none" ? 0 : Number(selectedTeam2Id)

    await editBracket(
      tournamentId,
      selectedEventId,
      {
        matches: [
          {
            id: match.id,
            team1Id: t1Id,
            team2Id: t2Id,
          },
        ],
      },
      successMsg,
      errorMsg
    )
    setIsEditing(false)
  }
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
          {/* <span className="text-sm font-medium text-gray-600">
            {match.status === "in_progress"
              ? "Live updates available"
              : match.status === "completed"
                ? "Match concluded"
                : "Match status details"}
          </span> */}
        </div>
        <Badge
          variant="outline"
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${currentStatus.color}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {t(currentStatus.label, { defaultValue: match.status.toUpperCase() })}
        </Badge>
      </div>

      {isEditing ? (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <h3 className="font-semibold text-gray-950">
            {t("brackets.match.edit.title", {
              defaultValue: "Edit Match Matchup",
            })}
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                {t("brackets.match.edit.team1", { defaultValue: "Team 1" })}
              </label>
              <Select
                value={selectedTeam1Id}
                onValueChange={setSelectedTeam1Id}
              >
                <SelectTrigger className="w-full border-gray-300 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t("brackets.match.tbd", { defaultValue: "TBD / Bye" })}
                  </SelectItem>
                  {allTeams.map((team) => (
                    <SelectItem
                      key={team.teamId}
                      value={team.teamId.toString()}
                    >
                      Seed {team.seed}:{" "}
                      {team.name || team.player1?.name || "TBD"}{" "}
                      {team.player2 ? `/ ${team.player2.name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                {t("brackets.match.edit.team2", { defaultValue: "Team 2" })}
              </label>
              <Select
                value={selectedTeam2Id}
                onValueChange={setSelectedTeam2Id}
              >
                <SelectTrigger className="w-full border-gray-300 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t("brackets.match.tbd", { defaultValue: "TBD / Bye" })}
                  </SelectItem>
                  {allTeams.map((team) => (
                    <SelectItem
                      key={team.teamId}
                      value={team.teamId.toString()}
                    >
                      Seed {team.seed}:{" "}
                      {team.name || team.player1?.name || "TBD"}{" "}
                      {team.player2 ? `/ ${team.player2.name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSaveEdit}
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {t("brackets.match.edit.save", { defaultValue: "Save Matchup" })}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              {t("brackets.match.edit.cancel", { defaultValue: "Cancel" })}
            </Button>
          </div>
        </div>
      ) : (
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
      )}

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

      {isHost && !isLocked && !isEditing && (
        <div className="space-y-2 border-t pt-4">
          <h3 className="mb-3 font-semibold text-gray-900">
            {t("brackets.match.details.actions")}
          </h3>
          <Button
            variant="outline"
            className="w-full justify-start border-gray-300 font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setIsEditing(true)}
          >
            {t("brackets.match.details.editMatch", {
              defaultValue: "Edit Matchup Teams",
            })}
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
      )}
    </div>
  )
}
