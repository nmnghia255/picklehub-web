"use client"

import { Save } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import type { SocialStatus } from "../../types"
import type { SocialFormData } from "./SocialForm.types"
import { SocialFormToggleRow } from "./SocialFormToggleRow"

export function SocialFormSidebar({
  formData,
  setFormData,
  isEditMode,
  onSubmit,
  onDelete,
}: {
  formData: SocialFormData
  setFormData: Dispatch<SetStateAction<SocialFormData>>
  isEditMode: boolean
  onSubmit: () => void
  onDelete: () => void
}) {
  const { t } = useSocialsTranslation()

  return (
    <Card className="sticky top-6 h-fit p-0">
      <CardContent className="space-y-5 p-6">
        <h2 className="text-lg font-semibold">
          {t("form.settingsAndPublish")}
        </h2>

        <div className="space-y-3">
          <div className="grid gap-2">
            <span className="text-sm font-medium">{t("form.status")}</span>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value as SocialStatus,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("filters.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">{t("labels.draft")}</SelectItem>
                <SelectItem value="PUBLISHED">
                  {t("labels.published")}
                </SelectItem>
                <SelectItem value="COMPLETED">
                  {t("labels.completed")}
                </SelectItem>
                <SelectItem value="CANCELLED">
                  {t("labels.cancelled")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <SocialFormToggleRow
            label={t("form.privateEvent")}
            checked={formData.isPrivate}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isPrivate: checked }))
            }
          />

          <SocialFormToggleRow
            label={t("form.autoApproveJoinRequests")}
            checked={formData.autoApproveJoinRequests}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                autoApproveJoinRequests: checked,
              }))
            }
          />

          <Separator />

          <Button
            size="lg"
            className="w-full"
            onClick={onSubmit}
            disabled={
              !formData.title ||
              !formData.note ||
              !formData.startTime ||
              !formData.endTime ||
              formData.maxSlots < 1 ||
              new Date(formData.endTime) <= new Date(formData.startTime)
            }
          >
            <Save className="size-4" />
            {isEditMode ? t("form.update") : t("form.create")}
          </Button>

          {isEditMode && (
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              {t("form.deleteSocial")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
