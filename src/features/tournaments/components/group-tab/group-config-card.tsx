"use client"

import { Loader2, Save } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useTournamentDashboardStore } from "../../stores/tournament-dashboard-store"
import { useGroupStageStore } from "../../stores/use-group-stage-store"

export function GroupConfigCard() {
  const { t } = useTournamentTranslation()

  const events = useTournamentDashboardStore((s) => s.events)
  const selectedEventId = useGroupStageStore((s) => s.selectedEventId)
  const selectedEvent = events?.find((e) => e.id.toString() === selectedEventId)

  const numGroups = useGroupStageStore((s) => s.numGroups)
  const totalAdvance = useGroupStageStore((s) => s.totalAdvance)
  const isSavingConfig = useGroupStageStore((s) => s.isSavingConfig)

  const setNumGroups = useGroupStageStore((s) => s.setNumGroups)
  const setTotalAdvance = useGroupStageStore((s) => s.setTotalAdvance)
  const saveConfig = useGroupStageStore((s) => s.saveConfig)

  const hasGroupConfig =
    selectedEvent &&
    typeof selectedEvent.numGroups === "number" &&
    selectedEvent.numGroups > 0

  // Synchronize store values when selectedEvent changes
  useEffect(() => {
    if (selectedEvent) {
      if (
        typeof selectedEvent.numGroups === "number" &&
        selectedEvent.numGroups > 0
      ) {
        setNumGroups(selectedEvent.numGroups)
        if (
          typeof selectedEvent.totalAdvance === "number" &&
          selectedEvent.totalAdvance > 0
        ) {
          setTotalAdvance(selectedEvent.totalAdvance)
        }
      } else {
        // Reset to default values for unconfigured events
        setNumGroups(4)
        setTotalAdvance(8)
      }
    }
  }, [selectedEvent, setNumGroups, setTotalAdvance])

  const handleSave = () => {
    void saveConfig(t)
  }

  return (
    <Card className="flex flex-col justify-between gap-0 border-gray-200 bg-white">
      <CardHeader className="border-b border-gray-100 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-gray-900">
          <Save className="h-5 w-5 text-gray-500" />
          {t("groupStage.configCardTitle", { defaultValue: "Configuration" })}
        </CardTitle>
        <CardDescription>
          {t("groupStage.configCardDesc", {
            defaultValue: "Configure group stage settings for this event.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between pt-4">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="num-groups"
              className="text-sm font-medium text-gray-700"
            >
              {t("groupStage.numGroupsLabel", {
                defaultValue: "Number of Groups",
              })}
            </Label>
            <Input
              id="num-groups"
              type="number"
              min={1}
              value={numGroups}
              onChange={(e) => setNumGroups(Number(e.target.value))}
              disabled={isSavingConfig || hasGroupConfig}
              className="border-gray-200 bg-white disabled:cursor-not-allowed disabled:opacity-75"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="total-advance"
              className="text-sm font-medium text-gray-700"
            >
              {t("groupStage.totalAdvanceLabel", {
                defaultValue: "Total Advanced Teams",
              })}
            </Label>
            <Input
              id="total-advance"
              type="number"
              min={1}
              value={totalAdvance}
              onChange={(e) => setTotalAdvance(Number(e.target.value))}
              disabled={isSavingConfig || hasGroupConfig}
              className="border-gray-200 bg-white disabled:cursor-not-allowed disabled:opacity-75"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSavingConfig || hasGroupConfig}
          className="mt-6 w-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isSavingConfig ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {hasGroupConfig
            ? t("groupStage.configSavedBtn", {
                defaultValue: "Configuration Saved",
              })
            : t("groupStage.saveConfigBtn", {
                defaultValue: "Save Configuration",
              })}
        </Button>
      </CardContent>
    </Card>
  )
}
