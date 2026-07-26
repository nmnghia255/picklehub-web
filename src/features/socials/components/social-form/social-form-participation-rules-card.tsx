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
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import type {
  AgeGroup,
  GenderPolicy,
  HostRole,
  SocialFormData,
} from "../../types/social"
import Field from "../social-detail/field"
import { SocialFormToggleRow } from "./social-form-toggle-row"

export function SocialFormParticipationRulesCard({
  formData,
  setFormData,
  isEditMode,
}: {
  formData: SocialFormData
  setFormData: Dispatch<SetStateAction<SocialFormData>>
  isEditMode?: boolean
}) {
  const { t } = useSocialsTranslation()

  return (
    <Card className="p-0">
      <CardContent className="space-y-5 p-6">
        <h2 className="text-lg font-semibold">
          {t("form.participationRules")}
        </h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("form.genderPolicy")}>
              <Select
                value={formData.genderPolicy}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    genderPolicy: value as GenderPolicy,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("filters.selectGenderPolicy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANY">{t("labels.any")}</SelectItem>
                  <SelectItem value="MALE_ONLY">
                    {t("labels.menOnly")}
                  </SelectItem>
                  <SelectItem value="FEMALE_ONLY">
                    {t("labels.womenOnly")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={t("form.ageGroup")}>
              <Select
                value={formData.ageGroup}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    ageGroup: value as AgeGroup,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("filters.selectAgeGroup")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANY">{t("labels.any")}</SelectItem>
                  <SelectItem value="JUNIOR">{t("labels.junior")}</SelectItem>
                  <SelectItem value="ADULT">{t("labels.adult")}</SelectItem>
                  <SelectItem value="SENIOR">{t("labels.senior")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("form.minimumSkillLevel")}>
              <Input
                type="number"
                value={formData.minimumLevel || 2}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minimumLevel: parseFloat(e.target.value) || 0,
                  }))
                }
                min={1}
                max={5.5}
                step={0.5}
              />
            </Field>
            <Field label={t("form.maximumSkillLevel")}>
              <Input
                type="number"
                value={formData.maximumLevel || 5}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maximumLevel: parseFloat(e.target.value) || 0,
                  }))
                }
                min={1}
                max={5.5}
                step={0.5}
              />
            </Field>
          </div>

          <Field label={t("form.hostRole")}>
            <Select
              disabled={isEditMode}
              value={formData.hostRole}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  hostRole: value as HostRole,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("form.hostRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOST_ONLY">
                  {t("sidebar.hostRoleHostOnly")}
                </SelectItem>
                <SelectItem value="HOST_AND_PLAY">
                  {t("sidebar.hostRoleHostAndPlay")}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <SocialFormToggleRow
            label={t("form.submitDupr")}
            checked={formData.submitDupr}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, submitDupr: checked }))
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
