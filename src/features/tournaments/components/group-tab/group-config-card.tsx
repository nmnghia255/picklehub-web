"use client"

import { Loader2, Save } from "lucide-react"

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
import { Switch } from "@/components/ui/switch"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useGroupStageStore } from "../../stores/use-group-stage-store"

export function GroupConfigCard() {
  const { t } = useTournamentTranslation()

  const groupStageEnabled = useGroupStageStore((s) => s.groupStageEnabled)
  const numGroups = useGroupStageStore((s) => s.numGroups)
  const advancePerGroup = useGroupStageStore((s) => s.advancePerGroup)
  const isSavingConfig = useGroupStageStore((s) => s.isSavingConfig)

  const setGroupStageEnabled = useGroupStageStore((s) => s.setGroupStageEnabled)
  const setNumGroups = useGroupStageStore((s) => s.setNumGroups)
  const setAdvancePerGroup = useGroupStageStore((s) => s.setAdvancePerGroup)
  const saveConfig = useGroupStageStore((s) => s.saveConfig)

  const handleSave = () => {
    void saveConfig(t)
  }

  return (
    <Card className="gap-0 border-gray-200 bg-white">
      <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-3">
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
      <CardContent className="flex h-full flex-col pt-4">
        <div className="flex flex-1 items-center justify-between border-gray-100 pb-3">
          <div className="space-y-0.5">
            <Label
              htmlFor="group-stage-switch"
              className="text-sm font-medium text-gray-900"
            >
              {t("groupStage.enabledLabel", {
                defaultValue: "Enable Group Stage",
              })}
            </Label>
            <p className="text-xs text-gray-500">
              {t("groupStage.enabledDesc", {
                defaultValue: "Toggle group stage for this event",
              })}
            </p>
          </div>
          <Switch
            id="group-stage-switch"
            checked={groupStageEnabled}
            onCheckedChange={setGroupStageEnabled}
          />
        </div>

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
            disabled={!groupStageEnabled}
            className="border-gray-200 bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="advance-per-group"
            className="text-sm font-medium text-gray-700"
          >
            {t("groupStage.advancePerGroupLabel", {
              defaultValue: "Advancement Per Group",
            })}
          </Label>
          <Input
            id="advance-per-group"
            type="number"
            min={1}
            value={advancePerGroup}
            onChange={(e) => setAdvancePerGroup(Number(e.target.value))}
            disabled={!groupStageEnabled}
            className="border-gray-200 bg-white"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isSavingConfig}
          className="mt-6 w-full bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {isSavingConfig ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {t("groupStage.saveConfigBtn", {
            defaultValue: "Save Configuration",
          })}
        </Button>
      </CardContent>
    </Card>
  )
}
