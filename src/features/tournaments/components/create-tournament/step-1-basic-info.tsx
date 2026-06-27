"use client"

import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { uploadImageAction } from "@/features/sport-center/actions/upload-image-action"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useCreateTournamentStore } from "../../stores/create-tournament-store"

export function Step1BasicInfo() {
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
      setFormValue("banner", url)
      toast.success(
        t("sponsors.dialog.paymentQrUploaded", {
          defaultValue: "Banner uploaded successfully!",
        })
      )
    } catch (error) {
      console.error(error)
      toast.error(
        t("sponsors.dialog.paymentQrUploadFailed", {
          defaultValue: "Failed to upload banner image.",
        })
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveBanner = () => {
    setFormValue("banner", "")
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="tournament-name">{t("create.step1.nameLabel")}</Label>
        <Input
          id="tournament-name"
          placeholder={t("create.step1.namePlaceholder")}
          value={formValues.name}
          onChange={(e) => setFormValue("name", e.target.value)}
          className="mt-3"
        />
      </div>

      <div>
        <Label htmlFor="description">
          {t("create.step1.descriptionLabel")}
        </Label>
        <Textarea
          id="description"
          placeholder={t("create.step1.descriptionPlaceholder")}
          value={formValues.description}
          onChange={(e) => setFormValue("description", e.target.value)}
          className="mt-3 min-h-24"
        />
      </div>

      <div>
        <Label htmlFor="banner">{t("create.step1.bannerLabel")}</Label>
        <div className="mt-3">
          {formValues.banner ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
              <Image
                src={formValues.banner}
                alt="Banner preview"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={handleRemoveBanner}
                disabled={isUploading}
                className="absolute top-2 right-2 rounded-full bg-gray-900/60 p-1.5 text-white shadow-md transition-all hover:scale-105 hover:bg-gray-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : isUploading ? (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <span className="mt-2 text-sm text-gray-500">
                {t("common.loading", { defaultValue: "Uploading banner..." })}
              </span>
            </div>
          ) : (
            <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-emerald-400 hover:bg-gray-100">
              <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                {t("create.step1.bannerUploadHint")}
              </p>
              <p className="mt-3 text-xs text-gray-500">
                {t("create.step1.bannerSizeHint")}
              </p>
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

      <div>
        <Label htmlFor="venue">{t("create.step1.venueLabel")}</Label>
        <Input
          id="venue"
          placeholder={t("create.step1.venuePlaceholder")}
          value={formValues.venue}
          onChange={(e) => setFormValue("venue", e.target.value)}
          className="mt-3"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-date">{t("create.step1.startDateLabel")}</Label>
          <Input
            id="start-date"
            type="date"
            value={formValues.startDate}
            onChange={(e) => setFormValue("startDate", e.target.value)}
            max={formValues.endDate || undefined}
            className="mt-3"
          />
        </div>
        <div>
          <Label htmlFor="end-date">{t("create.step1.endDateLabel")}</Label>
          <Input
            id="end-date"
            type="date"
            value={formValues.endDate}
            onChange={(e) => setFormValue("endDate", e.target.value)}
            min={formValues.startDate || undefined}
            className="mt-3"
          />
        </div>
      </div>
    </div>
  )
}
