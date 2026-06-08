"use client"

import { Upload } from "lucide-react"
import React from "react"

import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

type Props = {
  paymentProofFile: File | null
  paymentProofPreviewUrl: string
  paymentProofError: string
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: () => void
}

export function BankTransferProof({
  paymentProofFile,
  paymentProofPreviewUrl,
  paymentProofError,
  onFileChange,
  onRemoveFile,
}: Props) {
  const { t } = useSportCenterTranslation()
  return (
    <div className="rounded-2xl border border-dashed bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 p-2 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
          <Upload className="size-4" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="font-semibold">
              {t("booking.payment.uploadProofTitle")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("booking.payment.uploadProofDesc")}
            </p>
          </div>

          <label className="flex cursor-pointer flex-col gap-1 rounded-xl border border-dashed px-4 py-3 text-sm transition-colors hover:border-primary hover:bg-muted/40">
            <span className="font-medium">
              {t("booking.payment.chooseImage")}
            </span>
            <span className="text-xs text-muted-foreground">
              PNG, JPG, JPEG, WEBP
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="sr-only"
            />
          </label>

          {paymentProofFile ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 p-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{paymentProofFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(paymentProofFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-destructive hover:underline"
                onClick={onRemoveFile}
              >
                {t("booking.payment.removeImage")}
              </button>
            </div>
          ) : null}

          {paymentProofPreviewUrl ? (
            <div className="overflow-hidden rounded-xl border bg-muted/30">
              <img
                src={paymentProofPreviewUrl}
                alt={t("booking.payment.proofImageAlt")}
                className="h-56 w-full object-contain"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/20 p-3 text-sm text-muted-foreground">
              {t("booking.payment.noImageSelected")}
            </div>
          )}

          {paymentProofError && (
            <p className="text-sm text-destructive">{paymentProofError}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default BankTransferProof
