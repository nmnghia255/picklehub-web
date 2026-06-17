"use client"

import { Upload } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useCreateTournamentStore } from "../../stores/create-tournament-store"

export function Step1BasicInfo() {
  const { t } = useTournamentTranslation()
  const formValues = useCreateTournamentStore((state) => state.formValues)
  const setFormValue = useCreateTournamentStore((state) => state.setFormValue)

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="tournament-name">{t("create.step1.nameLabel")}</Label>
        <Input
          id="tournament-name"
          placeholder={t("create.step1.namePlaceholder")}
          value={formValues.name}
          onChange={(e) => setFormValue("name", e.target.value)}
          className="mt-3"
        />
      </div>

      <div>
        <Label htmlFor="description">
          {t("create.step1.descriptionLabel")}
        </Label>
        <Textarea
          id="description"
          placeholder={t("create.step1.descriptionPlaceholder")}
          value={formValues.description}
          onChange={(e) => setFormValue("description", e.target.value)}
          className="mt-3 min-h-24"
        />
      </div>

      <div>
        <Label htmlFor="banner">{t("create.step1.bannerLabel")}</Label>
        <div className="mt-3 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-emerald-400">
          <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            {t("create.step1.bannerUploadHint")}
          </p>
          <p className="mt-3 text-xs text-gray-500">
            {t("create.step1.bannerSizeHint")}
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="venue">{t("create.step1.venueLabel")}</Label>
        <Input
          id="venue"
          placeholder={t("create.step1.venuePlaceholder")}
          value={formValues.venue}
          onChange={(e) => setFormValue("venue", e.target.value)}
          className="mt-3"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-date">{t("create.step1.startDateLabel")}</Label>
          <Input
            id="start-date"
            type="date"
            value={formValues.startDate}
            onChange={(e) => setFormValue("startDate", e.target.value)}
            className="mt-3"
          />
        </div>
        <div>
          <Label htmlFor="end-date">{t("create.step1.endDateLabel")}</Label>
          <Input
            id="end-date"
            type="date"
            value={formValues.endDate}
            onChange={(e) => setFormValue("endDate", e.target.value)}
            className="mt-3"
          />
        </div>
      </div>
    </div>
  )
}
