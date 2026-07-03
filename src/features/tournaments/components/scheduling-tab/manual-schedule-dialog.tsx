"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Match } from "../../types/match"
import type { CourtInfo } from "../../types/tournament-court"
import { ManualScheduleForm } from "./manual-schedule-form"

interface ManualScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedMatch: Match | null
  courtsList: CourtInfo[]
  timeSlots: string[]
  onSubmit: (courtId: string, timeSlot: string) => void
}

function getTeamName(
  team: { name?: string } | string | null | undefined
): string {
  if (!team) return "TBD"
  if (typeof team === "object") return team.name || "TBD"
  return String(team)
}

export function ManualScheduleDialog({
  open,
  onOpenChange,
  selectedMatch,
  courtsList,
  timeSlots,
  onSubmit,
}: ManualScheduleDialogProps) {
  const { t } = useTournamentTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>
            {t("scheduling.manual.modalTitle", {
              defaultValue: "Manual Match Scheduling",
            })}
          </DialogTitle>
          <DialogDescription>
            {t("scheduling.manual.modalDesc", {
              defaultValue: "Select Court and Match Time for: ",
            })}
            <span className="font-semibold text-emerald-700">
              {selectedMatch &&
                `${getTeamName(selectedMatch.team1)} vs ${getTeamName(selectedMatch.team2)}`}
            </span>
          </DialogDescription>
        </DialogHeader>
        <ManualScheduleForm
          courtsList={courtsList}
          timeSlots={timeSlots}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
