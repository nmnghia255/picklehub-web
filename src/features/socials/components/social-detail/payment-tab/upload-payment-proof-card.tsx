"use client"

import { CheckCircle2, UploadCloud } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { submitPaymentAction } from "../../../actions/payment-actions"
import { UploadImageAction } from "../../../actions/upload-image-action"

interface UploadPaymentProofCardProps {
  socialId?: string
  amount: number
  isDisabled?: boolean
}

export function UploadPaymentProofCard({
  socialId,
  amount,
  isDisabled = false,
}: UploadPaymentProofCardProps) {
  const { t } = useSocialsTranslation()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setIsSuccess(false)

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    }
  }

  const handleUpload = async () => {
    if (!file || !socialId) return

    setIsUploading(true)
    try {
      const url = await UploadImageAction(file)
      await submitPaymentAction(socialId, url, amount)
      setIsSuccess(true)
      setFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit payment proof."
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-xl">{t("payment.uploadProof")}</CardTitle>
        <CardDescription className="mt-1">
          {t("payment.uploadDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 p-6">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center text-emerald-600">
            <CheckCircle2 className="size-12" />
            <div>
              <p className="font-semibold text-foreground">
                {t("payment.uploadSuccessTitle")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("payment.uploadSuccessDescription")}
              </p>
            </div>
          </div>
        ) : previewUrl ? (
          <div className="relative flex flex-col items-center gap-4 rounded-xl border border-border p-4">
            {}
            <img
              src={previewUrl}
              alt="Selected proof preview"
              className="h-auto max-h-[250px] rounded-lg object-contain"
            />
            <div className="relative mt-2">
              <input
                type="file"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isDisabled}
              />
              <Button
                variant="outline"
                type="button"
                size="sm"
                disabled={isDisabled}
              >
                {t("payment.selectFile")} ({file?.name})
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border/60 bg-muted/10 p-8 text-center transition-colors hover:bg-muted/30">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UploadCloud className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {t("payment.clickToUpload")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("payment.clickToUploadDescription")}
              </p>
            </div>
            <div className="relative mt-2">
              <input
                type="file"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isDisabled}
              />
              <Button variant="outline" type="button" disabled={isDisabled}>
                {t("payment.selectFile")}
              </Button>
            </div>
          </div>
        )}
        {!isSuccess && (
          <div className="flex justify-end pt-2">
            <Button
              disabled={!file || isUploading || isDisabled}
              onClick={handleUpload}
            >
              {isUploading ? t("common.uploading") : t("payment.submitProof")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
