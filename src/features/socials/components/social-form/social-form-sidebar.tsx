"use client"

import { Save } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import type { SocialFormData } from "../../types/social"
import { SocialFormToggleRow } from "./social-form-toggle-row"

export function SocialFormSidebar({
  formData,
  setFormData,
  isEditMode,
  isSubmitting,
  onSubmit,
  onDelete,
}: {
  formData: SocialFormData
  setFormData: Dispatch<SetStateAction<SocialFormData>>
  isEditMode: boolean
  isSubmitting?: boolean
  onSubmit: () => void
  onDelete: () => void
}) {
  const { t } = useSocialsTranslation()

  return (
    <Card className="sticky top-16 h-fit p-0">
      <CardContent className="space-y-5 p-6">
        <h2 className="text-lg font-semibold">
          {t("form.settingsAndPublish")}
        </h2>

        <div className="space-y-3">
          <Separator />

          <SocialFormToggleRow
            label={t("form.privateEvent")}
            checked={formData.isPrivate}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isPrivate: checked }))
            }
          />

          <SocialFormToggleRow
            label={t("form.isFree")}
            checked={formData.isFree}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isFree: checked }))
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
              isSubmitting ||
              !formData.title ||
              !formData.note ||
              !formData.startTime ||
              !formData.endTime ||
              formData.maxSlots < 1 ||
              new Date(formData.endTime) <= new Date(formData.startTime)
            }
          >
            {isSubmitting ? (
              <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {isEditMode ? t("form.update") : t("form.create")}
          </Button>

          {isEditMode && (
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={onDelete}
              disabled={isSubmitting}
            >
              {t("form.deleteSocial")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
