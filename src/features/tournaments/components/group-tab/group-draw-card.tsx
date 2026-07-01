"use client"

import { Loader2, Shuffle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useGroupStageStore } from "../../stores/use-group-stage-store"

export function GroupDrawCard() {
  const { t } = useTournamentTranslation()

  const groupStageEnabled = useGroupStageStore((s) => s.groupStageEnabled)
  const seedsList = useGroupStageStore((s) => s.seedsList)
  const safeSeeds = Array.isArray(seedsList) ? seedsList : []
  const selectedPriorityTeamIds = useGroupStageStore(
    (s) => s.selectedPriorityTeamIds
  )
  const isDrawing = useGroupStageStore((s) => s.isDrawing)

  const togglePriorityTeamId = useGroupStageStore((s) => s.togglePriorityTeamId)
  const drawGroups = useGroupStageStore((s) => s.drawGroups)

  const handleDraw = () => {
    void drawGroups(t)
  }

  return (
    <Card className="gap-0 border-gray-200 bg-white">
      <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-gray-900">
          <Shuffle className="h-5 w-5 text-gray-500" />
          {t("groupStage.drawCardTitle", { defaultValue: "World Cup Draw" })}
        </CardTitle>
        <CardDescription>
          {t("groupStage.drawCardDesc", {
            defaultValue: "Select priority teams (placed in Pot 1) and draw.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-full flex-col pt-4">
        <div className="flex-1 space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            {t("groupStage.priorityTeamsLabel", {
              defaultValue: "Priority Teams (Pot 1)",
            })}
          </Label>
          <div className="max-h-[160px] space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/50 p-2">
            {safeSeeds.length === 0 ? (
              <p className="p-2 text-center text-xs text-gray-500">
                {t("groupStage.noTeamsAvailable", {
                  defaultValue: "No teams/seeds available. Lock seeds first.",
                })}
              </p>
            ) : (
              safeSeeds.map((seed) => {
                if (!seed.teamId) return null
                const isChecked = selectedPriorityTeamIds.includes(seed.teamId)
                return (
                  <div
                    key={seed.teamId}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`team-${seed.teamId}`}
                      checked={isChecked}
                      onCheckedChange={() => togglePriorityTeamId(seed.teamId!)}
                    />
                    <label
                      htmlFor={`team-${seed.teamId}`}
                      className="cursor-pointer text-xs leading-none font-medium text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-75"
                    >
                      Seed {seed.seed}: {seed.team}
                    </label>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <Button
          onClick={handleDraw}
          disabled={isDrawing || !groupStageEnabled || safeSeeds.length === 0}
          className="mt-6 w-full bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {isDrawing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Shuffle className="mr-2 h-4 w-4" />
          )}
          {t("groupStage.drawGroupsBtn", { defaultValue: "Draw Groups" })}
        </Button>
      </CardContent>
    </Card>
  )
}
