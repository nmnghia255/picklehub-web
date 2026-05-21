"use client"

import type { Dispatch, SetStateAction } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import type { SocialFormat } from "../../types"
import Field from "../SocialDetail/Field"
import type { SocialFormData } from "./SocialForm.types"

export function SocialFormBasicInformationCard({
  formData,
  setFormData,
}: {
  formData: SocialFormData
  setFormData: Dispatch<SetStateAction<SocialFormData>>
}) {
  const { t } = useSocialsTranslation()

  return (
    <Card className="p-0">
      <CardContent className="space-y-5 p-6">
        <h2 className="text-lg font-semibold">{t("form.basicInformation")}</h2>
        <div className="space-y-4">
          <Field label={t("form.socialTitle")}>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder={t("form.socialTitlePlaceholder")}
              required
            />
          </Field>

          <Field label={t("form.description")}>
            <Textarea
              rows={4}
              value={formData.note}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, note: e.target.value }))
              }
              placeholder={t("form.descriptionPlaceholder")}
              required
            />
          </Field>

          <Field label={t("form.format")}>
            <Select
              value={formData.format}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  format: value as SocialFormat,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.format")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOCIAL">{t("labels.social")}</SelectItem>
                <SelectItem value="TOURNAMENT">
                  {t("labels.tournament")}
                </SelectItem>
                <SelectItem value="TRAINING">{t("labels.training")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}
