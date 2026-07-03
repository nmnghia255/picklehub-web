"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { RefereeAssignmentForm } from "./referee-assignment-form"

interface RefereeAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (refereeId: string) => void
}

export function RefereeAssignmentDialog({
  open,
  onOpenChange,
  onSubmit,
}: RefereeAssignmentDialogProps) {
  const { t } = useTournamentTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>
            {t("scheduling.referee.modalTitle", {
              defaultValue: "Assign Chief Referee",
            })}
          </DialogTitle>
          <DialogDescription>
            {t("scheduling.referee.modalDesc", {
              defaultValue:
                "Enter information of the referee assigned to be in charge of this match.",
            })}
          </DialogDescription>
        </DialogHeader>
        <RefereeAssignmentForm
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
