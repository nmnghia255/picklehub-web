"use client"

import { Loader2, Play, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useGroupStageStore } from "../../stores/use-group-stage-store"

export function GroupProgressionCard() {
  const { t } = useTournamentTranslation()

  const groups = useGroupStageStore((s) => s.groups)
  const totalAdvance = useGroupStageStore((s) => s.totalAdvance)
  const isGeneratingMatches = useGroupStageStore((s) => s.isGeneratingMatches)
  const isAdvancing = useGroupStageStore((s) => s.isAdvancing)

  const generateMatches = useGroupStageStore((s) => s.generateMatches)
  const advanceTeams = useGroupStageStore((s) => s.advanceTeams)

  const handleGenerate = () => {
    void generateMatches(t)
  }

  const handleAdvance = () => {
    void advanceTeams(t)
  }

  return (
    <Card className="flex flex-col justify-between gap-0 border-gray-200 bg-white">
      <CardHeader className="border-b border-gray-100 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-gray-900">
          <Play className="h-5 w-5 text-gray-500" />
          {t("groupStage.progressionCardTitle", {
            defaultValue: "Matches & Advancement",
          })}
        </CardTitle>
        <CardDescription>
          {t("groupStage.progressionCardDesc", {
            defaultValue: "Generate round-robin fixtures and advance teams.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between pt-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            {t("groupStage.matchGenLabel", {
              defaultValue: "Match Generation",
            })}
          </Label>
          <Button
            onClick={handleGenerate}
            disabled={isGeneratingMatches || groups.length === 0}
            variant="outline"
            className="w-full border-gray-200 hover:bg-gray-50"
          >
            {isGeneratingMatches ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4 text-emerald-600" />
            )}
            {t("groupStage.generateMatchesBtn", {
              defaultValue: "Generate Fixtures",
            })}
          </Button>
        </div>

        <div className="mt-2 space-y-3 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {t("groupStage.totalAdvanceLabel", {
                defaultValue: "Total Teams to Advance",
              })}
            </span>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-sm font-semibold text-gray-900">
              {totalAdvance}
            </span>
          </div>
          <Button
            onClick={handleAdvance}
            disabled={isAdvancing || groups.length === 0}
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isAdvancing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trophy className="mr-2 h-4 w-4" />
            )}
            {t("groupStage.advanceTeamsBtn", {
              defaultValue: "Advance Teams",
            })}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
