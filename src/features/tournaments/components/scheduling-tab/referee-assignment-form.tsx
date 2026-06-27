"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

interface RefereeAssignmentFormProps {
  onSubmit: (refereeId: string, refereeName: string) => void
  onClose: () => void
}

export function RefereeAssignmentForm({
  onSubmit,
  onClose,
}: RefereeAssignmentFormProps) {
  const { t } = useTournamentTranslation()
  const [refereeName, setRefereeName] = useState("")
  const [refereeId, setRefereeId] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!refereeName.trim()) {
      toast.error(
        t("scheduling.toasts.fillRefereeName", {
          defaultValue: "Please enter referee name",
        })
      )
      return
    }
    const finalId = refereeId.trim() || `ref_${Date.now()}`
    onSubmit(finalId, refereeName)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="ref-name">
          {t("scheduling.referee.name", { defaultValue: "Referee Name" })}
        </Label>
        <Input
          id="ref-name"
          placeholder={t("scheduling.referee.namePlaceholder", {
            defaultValue: "Enter referee name...",
          })}
          value={refereeName}
          onChange={(e) => setRefereeName(e.target.value)}
          className="mt-1.5 bg-white"
        />
      </div>
      <div>
        <Label htmlFor="ref-id">
          {t("scheduling.referee.id", {
            defaultValue: "Referee ID (Optional)",
          })}
        </Label>
        <Input
          id="ref-id"
          placeholder={t("scheduling.referee.idPlaceholder", {
            defaultValue: "Referee ID or leave empty...",
          })}
          value={refereeId}
          onChange={(e) => setRefereeId(e.target.value)}
          className="mt-1.5 bg-white"
        />
      </div>
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("scheduling.referee.close", { defaultValue: "Close" })}
        </Button>
        <Button
          type="submit"
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {t("scheduling.referee.assignBtn", {
            defaultValue: "Confirm Assignment",
          })}
        </Button>
      </div>
    </form>
  )
}
