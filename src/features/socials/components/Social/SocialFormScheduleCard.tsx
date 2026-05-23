"use client"

import type { Dispatch, SetStateAction } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import Field from "../SocialDetail/Field"
import type { SocialFormData } from "./SocialForm.types"

export function SocialFormScheduleCard({
  formData,
  setFormData,
}: {
  formData: SocialFormData
  setFormData: Dispatch<SetStateAction<SocialFormData>>
}) {
  const { t } = useSocialsTranslation()
  const hasInvalidTimeRange =
    Boolean(formData.startTime) &&
    Boolean(formData.endTime) &&
    new Date(formData.endTime) <= new Date(formData.startTime)

  return (
    <Card className="p-0">
      <CardContent className="space-y-5 p-6">
        <h2 className="text-lg font-semibold">{t("form.schedule")}</h2>
        <div className="space-y-4">
          <Field label={t("form.startTime")}>
            <Input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startTime: e.target.value }))
              }
              required
            />
          </Field>

          <Field label={t("form.endTime")}>
            <Input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endTime: e.target.value }))
              }
              required
            />
          </Field>

          {hasInvalidTimeRange && (
            <Alert variant="destructive">
              <AlertDescription>
                {t("form.validationEndAfterStart")}
              </AlertDescription>
            </Alert>
          )}

          <Field label={t("form.cancellationFreeze")}>
            <Input
              type="number"
              value={formData.cancellationFreezeHours}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  cancellationFreezeHours: parseInt(e.target.value) || 0,
                }))
              }
              min={0}
              max={168}
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}
