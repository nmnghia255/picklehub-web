"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useCreateTournamentStore } from "../../stores/create-tournament-store"

export function Step3Registration() {
  const { t } = useTournamentTranslation()
  const formValues = useCreateTournamentStore((state) => state.formValues)
  const setFormValue = useCreateTournamentStore((state) => state.setFormValue)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reg-open">{t("create.step2.regOpenLabel")}</Label>
          <Input
            id="reg-open"
            type="date"
            value={formValues.regOpen}
            onChange={(e) => setFormValue("regOpen", e.target.value)}
            max={formValues.regClose || formValues.startDate || undefined}
            className="mt-3"
          />
        </div>
        <div>
          <Label htmlFor="reg-close">{t("create.step2.regCloseLabel")}</Label>
          <Input
            id="reg-close"
            type="date"
            value={formValues.regClose}
            onChange={(e) => setFormValue("regClose", e.target.value)}
            min={formValues.regOpen || undefined}
            max={formValues.startDate || undefined}
            className="mt-3"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="max-participants">
            {t("create.step2.maxParticipantsLabel")}
          </Label>
          <Input
            id="max-participants"
            type="number"
            placeholder="100"
            value={formValues.maxParticipants}
            onChange={(e) => setFormValue("maxParticipants", e.target.value)}
            className="mt-3"
          />
        </div>
      </div>
    </div>
  )
}
