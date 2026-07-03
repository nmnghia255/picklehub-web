"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Match } from "../../types/match"

interface SlotScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slotToSchedule: {
    courtId: string
    courtName: string
    timeSlot: string
  } | null
  unscheduledMatches: Match[]
  setSelectedMatchForManual: (match: Match) => void
  manualSchedule: (
    courtId: string,
    timeSlot: string
  ) => Promise<{ success: boolean; error?: string }>
}

function getTeamName(
  team: { name?: string } | string | null | undefined
): string {
  if (!team) return "TBD"
  if (typeof team === "object") return team.name || "TBD"
  return String(team)
}

export function SlotScheduleDialog({
  open,
  onOpenChange,
  slotToSchedule,
  unscheduledMatches,
  setSelectedMatchForManual,
  manualSchedule,
}: SlotScheduleDialogProps) {
  const { t } = useTournamentTranslation()

  const handleSchedule = async (match: Match) => {
    if (!slotToSchedule) return

    setSelectedMatchForManual(match)
    const res = await manualSchedule(
      slotToSchedule.courtId,
      slotToSchedule.timeSlot
    )
    if (res.success) {
      toast.success(
        t("scheduling.toasts.scheduleSuccess", {
          defaultValue: "Match scheduled successfully",
        })
      )
      onOpenChange(false)
    } else {
      toast.error(
        res.error ||
          t("scheduling.toasts.scheduleFailed", {
            defaultValue: "Failed to schedule match",
          })
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col bg-white">
        <DialogHeader>
          <DialogTitle>
            {t("scheduling.slotModal.title", {
              defaultValue: "Select Match to Schedule",
            })}
          </DialogTitle>
          <DialogDescription>
            {t("scheduling.slotModal.desc", {
              defaultValue: "Select an unassigned match to schedule onto: ",
            })}
            <span className="font-semibold text-emerald-700">
              {slotToSchedule &&
                t("scheduling.slotModal.atLocation", {
                  court: slotToSchedule.courtName,
                  time: slotToSchedule.timeSlot,
                  defaultValue: `${slotToSchedule.courtName} at ${slotToSchedule.timeSlot}`,
                })}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-3 overflow-y-auto py-2 pr-1">
          {unscheduledMatches.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              {t("scheduling.slotModal.noUnscheduled", {
                defaultValue: "All matches are already scheduled.",
              })}
            </p>
          ) : (
            unscheduledMatches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 shadow-sm transition-all hover:border-emerald-500 hover:bg-emerald-50/20"
              >
                <div className="min-w-0 space-y-1 pr-3">
                  <div className="truncate text-xs font-bold">
                    {getTeamName(match.team1)} vs {getTeamName(match.team2)}
                  </div>
                  <div className="truncate text-[10px] text-gray-500">
                    {match.event} • {match.round}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="h-8 shrink-0 bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700"
                  onClick={() => handleSchedule(match)}
                >
                  {t("scheduling.slotModal.scheduleBtn", {
                    defaultValue: "Schedule",
                  })}
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="flex shrink-0 justify-end border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {t("scheduling.slotModal.closeBtn", {
              defaultValue: "Cancel",
            })}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
