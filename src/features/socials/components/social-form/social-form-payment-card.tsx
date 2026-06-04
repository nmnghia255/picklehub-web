"use client"

import { ImageIcon, Upload, X } from "lucide-react"
import {
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  useRef,
  useState,
} from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { MediaService } from "@/features/sport-center/api/media-service"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { UploadImageAction } from "../../action/upload-image-action"
import type { CreateSocialRequest as SocialFormData } from "../../types/social"
import Field from "../social-detail/Field"

export function SocialFormPaymentCard({
  formData,
  setFormData,
}: {
  formData: SocialFormData
  setFormData: Dispatch<SetStateAction<SocialFormData>>
}) {
  const { t } = useSocialsTranslation()
  const paymentQrInputRef = useRef<HTMLInputElement | null>(null)
  const [paymentQrFileName, setPaymentQrFileName] = useState("")
  const [paymentQrError, setPaymentQrError] = useState("")
  const [isUploadingPaymentQr, setIsUploadingPaymentQr] = useState(false)

  const handlePaymentQrChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null

    setPaymentQrError("")

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setPaymentQrFileName("")
      setPaymentQrError(t("form.paymentQrInvalidFile"))
      event.target.value = ""
      return
    }

    setPaymentQrFileName(file.name)
    setIsUploadingPaymentQr(true)

    try {
      const paymentQrUrl = await UploadImageAction(file)
      setFormData((prev) => ({
        ...prev,
        paymentQrUrl,
      }))
    } catch (error) {
      setPaymentQrFileName("")
      setPaymentQrError(
        error instanceof Error ? error.message : t("form.paymentQrUploadFailed")
      )
      setFormData((prev) => ({
        ...prev,
        paymentQrUrl: "",
      }))
    } finally {
      setIsUploadingPaymentQr(false)
      event.target.value = ""
    }
  }

  const handleRemovePaymentQr = () => {
    setPaymentQrFileName("")
    setPaymentQrError("")
    setFormData((prev) => ({
      ...prev,
      paymentQrUrl: "",
    }))
  }

  return (
    <Card className="p-0">
      <CardContent className="space-y-5 p-6">
        <h2 className="text-lg font-semibold">{t("form.paymentSetup")}</h2>
        <div className="space-y-4">
          <Field label={t("form.paymentQr")}>
            <div className="grid gap-3 rounded-md border border-dashed border-input p-4">
              {formData.paymentQrUrl ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex size-28 items-center justify-center overflow-hidden rounded-md border bg-muted">
                    <img
                      src={formData.paymentQrUrl}
                      alt={t("form.paymentQrPreview")}
                      className="size-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-medium">
                      {paymentQrFileName || t("form.paymentQrUploaded")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("form.paymentQrUploadedHint")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleRemovePaymentQr}
                    aria-label={t("form.paymentQrRemove")}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex size-12 items-center justify-center rounded-md bg-muted">
                    <ImageIcon className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      {t("form.paymentQrEmpty")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("form.paymentQrHint")}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploadingPaymentQr}
                  onClick={() => paymentQrInputRef.current?.click()}
                >
                  {isUploadingPaymentQr ? (
                    <Spinner className="mr-2 size-4" />
                  ) : (
                    <Upload className="mr-2 size-4" />
                  )}
                  {isUploadingPaymentQr
                    ? t("form.paymentQrUploading")
                    : t("form.paymentQrChooseFile")}
                </Button>
                <Input
                  ref={paymentQrInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => void handlePaymentQrChange(event)}
                  disabled={isUploadingPaymentQr}
                />
              </div>

              {paymentQrError ? (
                <p className="text-sm text-destructive">{paymentQrError}</p>
              ) : null}
            </div>
          </Field>

          <Field label={t("form.paymentCode")}>
            <Input
              value={formData.paymentCode || ""}
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
              value={formData.paymentNote || ""}
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
