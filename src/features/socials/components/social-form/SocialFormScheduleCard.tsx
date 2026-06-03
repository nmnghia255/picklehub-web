"use client"

import type { Dispatch, SetStateAction } from "react"
import { useEffect } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCourtScheduleStore } from "@/features/sport-center-management/stores/court-schedule-store"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import Field from "../social-detail/Field"
import type { SocialFormData } from "./SocialForm.types"

function SportCenterSelect({
  value,
  onChange,
  placeholder,
}: {
  value?: string
  onChange: (val: string) => void
  placeholder?: string
}) {
  const { sportCenters, fetchSportCenters } = useCourtScheduleStore()

  useEffect(() => {
    if (!sportCenters || sportCenters.length === 0) fetchSportCenters()
  }, [sportCenters, fetchSportCenters])

  return (
    <div className="w-full">
      <Select value={value} onValueChange={(v) => onChange(v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="w-full">
          {sportCenters.map((center) => (
            <SelectItem key={center.id} value={center.id}>
              {center.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

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

          <Field label={t("form.bookedSportCenter")}>
            <SportCenterSelect
              value={formData.bookedSportCenter}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, bookedSportCenter: value }))
              }
              placeholder={t("form.bookedSportCenterPlaceholder")}
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}
