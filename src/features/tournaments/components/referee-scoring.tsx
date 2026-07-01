import { Check, Clock, MapPin, Undo2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { updateFixtureResultAction } from "../actions/schedule-actions"
import type { AssignedReferee } from "../types/referee"

interface RefereeScoringProps {
  match?: AssignedReferee
  onClose?: () => void
}

export function RefereeScoring({ match, onClose }: RefereeScoringProps) {
  const { t } = useTournamentTranslation()
  const [team1Score, setTeam1Score] = useState(match ? 0 : 9)
  const [team2Score, setTeam2Score] = useState(match ? 0 : 7)
  const [currentSet] = useState(1)
  const [isSaving, setIsSaving] = useState(false)

  const addPoint = (team: 1 | 2) => {
    if (team === 1) {
      setTeam1Score(team1Score + 1)
    } else {
      setTeam2Score(team2Score + 1)
    }
  }

  const undo = () => {
    if (team1Score > team2Score && team1Score > 0) {
      setTeam1Score(team1Score - 1)
    } else if (team2Score > 0) {
      setTeam2Score(team2Score - 1)
    }
  }

  const handleConfirmScore = async () => {
    if (!match) {
      toast.info("Scoring mockup confirmed (no server update)")
      onClose?.()
      return
    }

    setIsSaving(true)
    try {
      const res = await updateFixtureResultAction(
        match.tournamentId,
        match.id,
        {
          score: `${team1Score} - ${team2Score}`,
          status: "completed",
        }
      )
      if (res.success) {
        toast.success("Match score updated successfully!")
        onClose?.()
      } else {
        toast.error(res.error || "Failed to update score")
      }
    } catch (err) {
      console.error(err)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const t1Name = match ? match.team1Id || "TBD Team 1" : "Martinez / Chen"
  const t2Name = match ? match.team2Id || "TBD Team 2" : "Anderson / Smith"
  const courtName = match?.court?.name || "Court 2"
  const timeStr = match?.time || "24:32"

  return (
    <div className="relative min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Match Info */}
        <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="mb-1 text-xl font-bold text-gray-900">
                  {t("referee.matchInfo.title")}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1 font-semibold">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    {courtName}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    {timeStr}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700">
                  {t("referee.matchInfo.set", { set: currentSet })}
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-700">
                  {t("referee.matchInfo.inProgress")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scoring Area */}
        <div className="relative mb-6 grid grid-cols-2 gap-6">
          {/* Team 1 */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <div className="mb-6 text-center">
                <div className="mb-2 text-sm font-medium tracking-wider text-gray-500 uppercase">
                  {t("referee.scoring.teamA")}
                </div>
                <h3 className="mb-1 truncate text-xl font-bold text-gray-900">
                  {t1Name}
                </h3>
                <Badge className="bg-gray-100 text-gray-700">
                  {t("referee.scoring.seed", { seed: 1 })}
                </Badge>
              </div>

              <div className="mb-8">
                <div className="mb-4 text-center text-8xl font-black text-emerald-600 select-none">
                  {team1Score}
                </div>
                <div className="text-center text-sm font-semibold text-gray-400">
                  {t("referee.scoring.currentScore")}
                </div>
              </div>

              <Button
                onClick={() => addPoint(1)}
                className="h-20 w-full bg-emerald-600 text-xl font-extrabold text-white shadow-md transition-all duration-250 hover:bg-emerald-700 active:scale-95"
                disabled={isSaving}
              >
                {t("referee.scoring.addPoint")}
              </Button>
            </CardContent>
          </Card>

          {/* Team 2 */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <div className="mb-6 text-center">
                <div className="mb-2 text-sm font-medium tracking-wider text-gray-500 uppercase">
                  {t("referee.scoring.teamB")}
                </div>
                <h3 className="mb-1 truncate text-xl font-bold text-gray-900">
                  {t2Name}
                </h3>
                <Badge className="bg-gray-100 text-gray-700">
                  {t("referee.scoring.seed", { seed: 4 })}
                </Badge>
              </div>

              <div className="mb-8">
                <div className="mb-4 text-center text-8xl font-black text-emerald-600 select-none">
                  {team2Score}
                </div>
                <div className="text-center text-sm font-semibold text-gray-400">
                  {t("referee.scoring.currentScore")}
                </div>
              </div>

              <Button
                onClick={() => addPoint(2)}
                className="h-20 w-full bg-emerald-600 text-xl font-extrabold text-white shadow-md transition-all duration-250 hover:bg-emerald-700 active:scale-95"
                disabled={isSaving}
              >
                {t("referee.scoring.addPoint")}
              </Button>
            </CardContent>
          </Card>

          {/* VS Indicator */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-gray-100 shadow-sm">
              <span className="text-sm font-bold text-gray-500 uppercase">
                {t("referee.vs", { defaultValue: "vs" })}
              </span>
            </div>
          </div>
        </div>

        {/* Set History */}
        <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <h3 className="mb-4 text-sm font-bold tracking-wider text-gray-500 uppercase">
              {t("referee.setHistory.title")}
            </h3>
            <div className="flex gap-4">
              <div className="flex-1 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-center">
                <div className="mb-1 text-xs text-gray-500">
                  {t("referee.setHistory.set", { set: 1 })}
                </div>
                <div className="text-xl font-extrabold text-emerald-700">
                  {match ? `${team1Score} - ${team2Score}` : "11 - 9"}
                </div>
                <div className="mt-1 truncate text-xs font-semibold text-emerald-600">
                  {match
                    ? team1Score >= team2Score
                      ? t1Name
                      : t2Name
                    : "Martinez / Chen"}
                </div>
              </div>
              <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
                <div className="mb-1 text-xs text-gray-500">
                  {t("referee.setHistory.set", { set: 2 })}
                </div>
                <div className="text-xl font-semibold text-gray-400">- -</div>
                <div className="mt-1 text-xs text-gray-400">
                  {t("referee.setHistory.notStarted")}
                </div>
              </div>
              <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
                <div className="mb-1 text-xs text-gray-500">
                  {t("referee.setHistory.set", { set: 3 })}
                </div>
                <div className="text-xl font-semibold text-gray-400">- -</div>
                <div className="mt-1 text-xs text-gray-400">
                  {t("referee.setHistory.notStarted")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={undo}
            variant="outline"
            className="h-16 border-gray-200 text-lg font-bold text-gray-700 hover:bg-gray-50"
            disabled={isSaving}
          >
            <Undo2 className="mr-2 h-5 w-5" />
            {t("referee.actions.undo")}
          </Button>
          <Button
            onClick={handleConfirmScore}
            className="h-16 bg-emerald-600 text-lg font-bold text-white hover:bg-emerald-700"
            disabled={isSaving}
          >
            <Check className="mr-2 h-5 w-5" />
            {isSaving ? "Saving..." : t("referee.actions.confirm")}
          </Button>
        </div>
      </div>
    </div>
  )
}
