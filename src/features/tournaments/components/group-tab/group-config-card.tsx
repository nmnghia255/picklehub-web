"use client"

import { Loader2, Save } from "lucide-react"
import { useEffect } from "react"
import { toast } from "sonner"

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
import type { TournamentEvent } from "../../types/tournament-event"

interface GroupConfigCardProps {
  events?: TournamentEvent[]
}

export function GroupConfigCard({
  events: eventsProp,
}: GroupConfigCardProps = {}) {
  const { t } = useTournamentTranslation()

  const storeEvents = useTournamentDashboardStore((s) => s.events)
  const events = eventsProp && eventsProp.length > 0 ? eventsProp : storeEvents
  const selectedEventId = useGroupStageStore((s) => s.selectedEventId)
  const selectedEvent = events?.find((e) => e.id.toString() === selectedEventId)

  const numGroups = useGroupStageStore((s) => s.numGroups)
  const totalAdvance = useGroupStageStore((s) => s.totalAdvance)
  const seedsList = useGroupStageStore((s) => s.seedsList)
  const groups = useGroupStageStore((s) => s.groups)
  const isSavingConfig = useGroupStageStore((s) => s.isSavingConfig)

  const setNumGroups = useGroupStageStore((s) => s.setNumGroups)
  const setTotalAdvance = useGroupStageStore((s) => s.setTotalAdvance)
  const saveConfig = useGroupStageStore((s) => s.saveConfig)

  const hasGroupConfig =
    selectedEvent &&
    typeof selectedEvent.numGroups === "number" &&
    selectedEvent.numGroups > 0

  const safeSeeds = Array.isArray(seedsList) ? seedsList : []
  const totalTeamsFromGroups = Array.isArray(groups)
    ? groups.reduce((acc, g) => acc + (g.memberships?.length || 0), 0)
    : 0
  const totalTeams =
    totalTeamsFromGroups > 0
      ? totalTeamsFromGroups
      : safeSeeds.length > 0
        ? safeSeeds.length
        : Math.max(
            selectedEvent?.capacity ?? 0,
            selectedEvent?.participants ?? 0
          )

  const isNumGroupsTooSmall = numGroups < 2
  const isNumGroupsTooLarge = totalTeams > 0 && numGroups >= totalTeams
  const isNumGroupsInvalid = isNumGroupsTooSmall || isNumGroupsTooLarge

  const isTotalAdvanceTooLarge = totalTeams > 0 && totalAdvance >= totalTeams
  const isTotalAdvanceTooSmall = totalAdvance < numGroups
  const isTotalAdvanceInvalid = isTotalAdvanceTooLarge || isTotalAdvanceTooSmall

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
        const defaultTotal = Math.max(
          selectedEvent?.capacity ?? 0,
          selectedEvent?.participants ?? 0
        )
        const defaultNumGroups =
          defaultTotal > 0
            ? Math.min(4, Math.max(2, Math.floor(defaultTotal / 2)))
            : 4
        setNumGroups(defaultNumGroups)
        setTotalAdvance(
          defaultTotal > 0
            ? Math.min(8, Math.max(defaultNumGroups, defaultTotal - 1))
            : 8
        )
      }
    }
  }, [selectedEvent, setNumGroups, setTotalAdvance])

  const handleNumGroupsChange = (val: number) => {
    if (isNaN(val)) return
    const maxVal = totalTeams > 0 ? totalTeams - 1 : Infinity
    const clampedVal = Math.min(val, maxVal)
    setNumGroups(clampedVal)
    if (totalAdvance < clampedVal) {
      setTotalAdvance(clampedVal)
    }
  }

  const handleNumGroupsBlur = () => {
    const minVal = 2
    const maxVal = totalTeams > 0 ? totalTeams - 1 : Infinity
    if (numGroups < minVal) {
      setNumGroups(minVal)
      if (totalAdvance < minVal) {
        setTotalAdvance(minVal)
      }
    } else if (numGroups > maxVal) {
      setNumGroups(maxVal)
    }
  }

  const handleTotalAdvanceChange = (val: number) => {
    if (isNaN(val)) return
    const maxVal = totalTeams > 0 ? totalTeams - 1 : Infinity
    const clampedVal = Math.min(val, maxVal)
    setTotalAdvance(clampedVal)
  }

  const handleTotalAdvanceBlur = () => {
    const minVal = numGroups
    const maxVal = totalTeams > 0 ? totalTeams - 1 : Infinity
    if (totalAdvance < minVal) {
      setTotalAdvance(minVal)
    } else if (totalAdvance > maxVal) {
      setTotalAdvance(maxVal)
    }
  }

  const handleSave = () => {
    if (isNumGroupsTooSmall) {
      toast.error(
        t("groupStage.minGroupsError", {
          defaultValue: "Number of groups must be at least 2.",
        })
      )
      return
    }
    if (isNumGroupsTooLarge) {
      toast.error(
        t("groupStage.maxGroupsError", {
          defaultValue:
            "Number of groups must be smaller than total teams ({{total}}).",
          total: totalTeams,
        })
      )
      return
    }
    if (isTotalAdvanceTooLarge) {
      toast.error(
        t("groupStage.maxAdvanceError", {
          defaultValue:
            "Number of advancing teams must be smaller than total teams ({{total}}).",
          total: totalTeams,
        })
      )
      return
    }
    if (isTotalAdvanceTooSmall) {
      toast.error(
        t("groupStage.minAdvanceError", {
          defaultValue:
            "Number of advancing teams must be at least the number of groups ({{numGroups}}).",
          numGroups,
        })
      )
      return
    }
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
              min={2}
              max={totalTeams > 0 ? totalTeams - 1 : undefined}
              value={numGroups}
              onChange={(e) => handleNumGroupsChange(Number(e.target.value))}
              onBlur={handleNumGroupsBlur}
              disabled={isSavingConfig || hasGroupConfig}
              className="border-gray-200 bg-white disabled:cursor-not-allowed disabled:opacity-75"
            />
            {isNumGroupsTooSmall && (
              <p className="text-xs text-red-500">
                {t("groupStage.minGroupsError", {
                  defaultValue: "Number of groups must be at least 2.",
                })}
              </p>
            )}
            {isNumGroupsTooLarge && (
              <p className="text-xs text-red-500">
                {t("groupStage.maxGroupsError", {
                  defaultValue: `Number of groups must be smaller than total teams (${totalTeams}).`,
                  total: totalTeams,
                })}
              </p>
            )}
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
              min={numGroups}
              max={totalTeams > 0 ? totalTeams - 1 : undefined}
              value={totalAdvance}
              onChange={(e) => handleTotalAdvanceChange(Number(e.target.value))}
              onBlur={handleTotalAdvanceBlur}
              disabled={isSavingConfig || hasGroupConfig}
              className="border-gray-200 bg-white disabled:cursor-not-allowed disabled:opacity-75"
            />
            {isTotalAdvanceTooLarge && (
              <p className="text-xs text-red-500">
                {t("groupStage.maxAdvanceError", {
                  defaultValue: `Number of advancing teams must be smaller than total teams (${totalTeams}).`,
                  total: totalTeams,
                })}
              </p>
            )}
            {isTotalAdvanceTooSmall && (
              <p className="text-xs text-red-500">
                {t("groupStage.minAdvanceError", {
                  defaultValue: `Number of advancing teams must be at least the number of groups (${numGroups}).`,
                  numGroups,
                })}
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={
            isSavingConfig ||
            hasGroupConfig ||
            isNumGroupsInvalid ||
            isTotalAdvanceInvalid
          }
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
