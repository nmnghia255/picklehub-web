"use client"

import {
  FileText,
  Hash,
  Landmark,
  Loader2,
  QrCode,
  Upload,
  User,
  X,
} from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

import { PaymentSelector } from "@/components/common/payment-selector"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { uploadImageAction } from "@/features/sport-center/actions/upload-image-action"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useCreateTournamentStore } from "../../stores/create-tournament-store"

export function Step5Payment() {
  const { t } = useTournamentTranslation()
  const formValues = useCreateTournamentStore((state) => state.formValues)
  const setFormValue = useCreateTournamentStore((state) => state.setFormValue)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error(
        t("eventDetail.selectImageError", {
          defaultValue: "Please select an image file",
        })
      )
      return
    }

    setIsUploading(true)
    try {
      const url = await uploadImageAction(file)
      setFormValue("paymentQrUrl", url)
      toast.success(
        t("sponsors.dialog.paymentQrUploaded", {
          defaultValue: "QR code uploaded successfully!",
        })
      )
    } catch (error) {
      console.error(error)
      toast.error(
        t("sponsors.dialog.paymentQrUploadFailed", {
          defaultValue: "Failed to upload QR code image.",
        })
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveQr = () => {
    setFormValue("paymentQrUrl", "")
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {t("create.step5.paymentTitle", { defaultValue: "Payment Details" })}
        </h3>
        <p className="text-sm text-gray-500">
          {t("create.step5.paymentSubtitle", {
            defaultValue:
              "Configure your banking details for tournament registration fees.",
          })}
        </p>
      </div>

      <PaymentSelector
        onSelectProfile={(selected) => {
          setFormValue("paymentBankName", selected.paymentBankName)
          setFormValue("paymentAccountName", selected.paymentAccountName)
          setFormValue("paymentAccountNumber", selected.paymentAccountNumber)
          if (selected.paymentQrUrl) {
            setFormValue("paymentQrUrl", selected.paymentQrUrl)
          }
        }}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column: Bank Details Stack */}
        <div className="space-y-4">
          {/* Bank Name */}
          <div className="space-y-2">
            <Label
              htmlFor="payment-bank-name"
              className="flex items-center gap-2"
            >
              <Landmark className="h-4 w-4 text-gray-400" />
              {t("create.step5.bankNameLabel", { defaultValue: "Bank Name *" })}
            </Label>
            <Input
              id="payment-bank-name"
              placeholder={t("create.step5.bankNamePlaceholder", {
                defaultValue: "e.g., Vietcombank",
              })}
              value={formValues.paymentBankName}
              onChange={(e) => setFormValue("paymentBankName", e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Account Holder Name */}
          <div className="space-y-2">
            <Label
              htmlFor="payment-account-name"
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4 text-gray-400" />
              {t("create.step5.accountNameLabel", {
                defaultValue: "Account Holder Name *",
              })}
            </Label>
            <Input
              id="payment-account-name"
              placeholder={t("create.step5.accountNamePlaceholder", {
                defaultValue: "e.g., NGUYEN VAN AN",
              })}
              value={formValues.paymentAccountName}
              onChange={(e) =>
                setFormValue("paymentAccountName", e.target.value)
              }
              className="mt-1 font-medium uppercase"
            />
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label
              htmlFor="payment-account-number"
              className="flex items-center gap-2"
            >
              <Hash className="h-4 w-4 text-gray-400" />
              {t("create.step5.accountNumberLabel", {
                defaultValue: "Account Number *",
              })}
            </Label>
            <Input
              id="payment-account-number"
              placeholder={t("create.step5.accountNumberPlaceholder", {
                defaultValue: "e.g., 1023456789",
              })}
              value={formValues.paymentAccountNumber}
              onChange={(e) =>
                setFormValue("paymentAccountNumber", e.target.value)
              }
              className="mt-1 font-mono"
            />
          </div>
        </div>

        {/* Right Column: QR Code Image Upload Box */}
        <div className="flex flex-col">
          <Label className="mb-2 flex items-center gap-2">
            <QrCode className="h-4 w-4 text-gray-400" />
            {t("create.step5.qrUrlLabel", {
              defaultValue: "QR Code Image (optional)",
            })}
          </Label>
          <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 text-center transition-all hover:border-emerald-400">
            {formValues.paymentQrUrl ? (
              <div className="relative h-40 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <Image
                  src={formValues.paymentQrUrl}
                  alt={t("common.previewImageAlt")}
                  fill
                  sizes="160px"
                  className="object-contain p-2"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={handleRemoveQr}
                  disabled={isUploading}
                  className="absolute top-1 right-1 rounded-full bg-gray-900/60 p-1.5 text-white shadow-md transition-all hover:scale-105 hover:bg-gray-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : isUploading ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <span className="text-sm font-medium text-gray-500">
                  {t("common.loading", {
                    defaultValue: "Uploading QR Code...",
                  })}
                </span>
              </div>
            ) : (
              <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center space-y-3 py-6">
                <div className="rounded-full bg-emerald-50 p-3 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-700">
                    {t("create.step5.qrUrlPlaceholder", {
                      defaultValue: "Click to upload QR code image",
                    })}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Payment Note */}
      <div className="space-y-2">
        <Label htmlFor="payment-note" className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          {t("create.step5.noteLabel", {
            defaultValue: "Payment Note / Instructions (optional)",
          })}
        </Label>
        <Textarea
          id="payment-note"
          placeholder={t("create.step5.notePlaceholder", {
            defaultValue:
              "e.g., Please enter [Registration ID] as transfer comment.",
          })}
          value={formValues.paymentNote}
          onChange={(e) => setFormValue("paymentNote", e.target.value)}
          className="mt-1 min-h-[100px]"
        />
      </div>
    </div>
  )
}
