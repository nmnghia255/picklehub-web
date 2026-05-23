"use client"

import type { Dispatch, SetStateAction } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import Field from "../SocialDetail/Field"
import type { SocialFormData } from "./SocialForm.types"

export function SocialFormPaymentCard({
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
        <h2 className="text-lg font-semibold">{t("form.paymentSetup")}</h2>
        <div className="space-y-4">
          <Field label={t("form.totalExpensePerPerson")}>
            <div className="flex items-center gap-2 rounded-md border border-input bg-transparent px-3">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                className="border-0 px-0 shadow-none focus-visible:ring-0"
                type="number"
                value={formData.totalExpense}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalExpense: parseFloat(e.target.value) || 0,
                  }))
                }
                min={0}
                step={1}
              />
            </div>
          </Field>

          <Field label={t("form.paymentCode")}>
            <Input
              value={formData.paymentCode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentCode: e.target.value,
                }))
              }
              placeholder={t("form.paymentCodePlaceholder")}
            />
          </Field>

          <Field label={t("form.paymentInstructions")}>
            <Textarea
              rows={2}
              value={formData.paymentNote}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentNote: e.target.value,
                }))
              }
              placeholder={t("form.paymentInstructionsPlaceholder")}
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}
