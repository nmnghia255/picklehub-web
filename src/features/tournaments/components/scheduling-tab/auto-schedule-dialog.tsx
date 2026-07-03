"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { TournamentEvent } from "../../types/tournament-event"
import { AutoScheduleDialogForm } from "./auto-schedule-dialog-form"

interface AutoScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tournamentId: number
  events: TournamentEvent[]
  earliestTime: string
  latestTime: string
  onApplied: () => void
}

export function AutoScheduleDialog({
  open,
  onOpenChange,
  tournamentId,
  events,
  earliestTime,
  latestTime,
  onApplied,
}: AutoScheduleDialogProps) {
  const { t } = useTournamentTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-white p-6">
        <DialogHeader className="mb-0 space-y-3">
          <DialogTitle>
            {t("scheduling.autoScheduleForm.title", {
              defaultValue: "Auto Schedule & Court Optimization",
            })}
          </DialogTitle>
          <DialogDescription>
            {t("scheduling.autoScheduleForm.description", {
              defaultValue:
                "The system will calculate and allocate matches into empty courts and optimal time slots.",
            })}
          </DialogDescription>
        </DialogHeader>
        <AutoScheduleDialogForm
          tournamentId={tournamentId}
          events={events}
          defaultStartTime={earliestTime}
          defaultEndTime={latestTime}
          onClose={() => onOpenChange(false)}
          onApplied={onApplied}
        />
      </DialogContent>
    </Dialog>
  )
}
