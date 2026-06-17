import { Check, Clock, MapPin, Undo2 } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

export function RefereeScoring() {
  const { t } = useTournamentTranslation()
  const [team1Score, setTeam1Score] = useState(9)
  const [team2Score, setTeam2Score] = useState(7)
  const [currentSet] = useState(1)
  const [matchTime] = useState("24:32")

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Match Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="mb-1 text-xl font-semibold text-gray-900">
                  {t("referee.matchInfo.title")}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {t("referee.matchInfo.court", { court: 2 })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {t("referee.matchInfo.matchTime", { time: matchTime })}
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
        <div className="mb-6 grid grid-cols-2 gap-6">
          {/* Team 1 */}
          <Card className="bg-white">
            <CardContent className="p-8">
              <div className="mb-6 text-center">
                <div className="mb-2 text-sm font-medium text-gray-500">
                  {t("referee.scoring.teamA")}
                </div>
                <h3 className="mb-1 text-xl font-semibold text-gray-900">
                  Martinez / Chen
                </h3>
                <Badge className="bg-gray-100 text-gray-700">
                  {t("referee.scoring.seed", { seed: 1 })}
                </Badge>
              </div>

              <div className="mb-8">
                <div className="mb-4 text-center text-8xl font-bold text-gray-900">
                  {team1Score}
                </div>
                <div className="text-center text-sm text-gray-500">
                  {t("referee.scoring.currentScore")}
                </div>
              </div>

              <Button
                onClick={() => addPoint(1)}
                className="h-24 w-full bg-emerald-600 text-2xl font-semibold hover:bg-emerald-700"
              >
                {t("referee.scoring.addPoint")}
              </Button>
            </CardContent>
          </Card>

          {/* Team 2 */}
          <Card className="bg-white">
            <CardContent className="p-8">
              <div className="mb-6 text-center">
                <div className="mb-2 text-sm font-medium text-gray-500">
                  {t("referee.scoring.teamB")}
                </div>
                <h3 className="mb-1 text-xl font-semibold text-gray-900">
                  Anderson / Smith
                </h3>
                <Badge className="bg-gray-100 text-gray-700">
                  {t("referee.scoring.seed", { seed: 4 })}
                </Badge>
              </div>

              <div className="mb-8">
                <div className="mb-4 text-center text-8xl font-bold text-gray-900">
                  {team2Score}
                </div>
                <div className="text-center text-sm text-gray-500">
                  {t("referee.scoring.currentScore")}
                </div>
              </div>

              <Button
                onClick={() => addPoint(2)}
                className="h-24 w-full bg-emerald-600 text-2xl font-semibold hover:bg-emerald-700"
              >
                {t("referee.scoring.addPoint")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* VS Indicator */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <span className="text-xl font-bold text-gray-600">
              {t("referee.vs")}
            </span>
          </div>
        </div>

        {/* Set History */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">
              {t("referee.setHistory.title")}
            </h3>
            <div className="flex gap-4">
              <div className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                <div className="mb-1 text-sm text-gray-600">
                  {t("referee.setHistory.set", { set: 1 })}
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  11 - 9
                </div>
                <div className="mt-1 text-xs text-emerald-600">
                  Martinez / Chen
                </div>
              </div>
              <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <div className="mb-1 text-sm text-gray-600">
                  {t("referee.setHistory.set", { set: 2 })}
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  {team1Score} - {team2Score}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {t("referee.setHistory.inProgress")}
                </div>
              </div>
              <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <div className="mb-1 text-sm text-gray-600">
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
          <Button onClick={undo} variant="outline" className="h-16 text-lg">
            <Undo2 className="mr-2 h-5 w-5" />
            {t("referee.actions.undo")}
          </Button>
          <Button className="h-16 bg-emerald-600 text-lg hover:bg-emerald-700">
            <Check className="mr-2 h-5 w-5" />
            {t("referee.actions.confirm")}
          </Button>
        </div>
      </div>
    </div>
  )
}
