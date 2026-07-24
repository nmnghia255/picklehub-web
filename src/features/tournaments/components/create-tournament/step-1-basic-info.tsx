"use client"

import { format } from "date-fns"
import { CalendarIcon, Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { uploadImageAction } from "@/features/sport-center/actions/upload-image-action"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import { useCreateTournamentStore } from "../../stores/create-tournament-store"

const parseDateString = (dateStr: string) => {
  if (!dateStr) return undefined
  const [year, month, day] = dateStr.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

const formatDateString = (date: Date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function Step1BasicInfo() {
  const { t } = useTournamentTranslation()
  const { t: tCommon } = useTranslation("common")
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
        t("sponsors.dialog.imageUploaded", {
          defaultValue: "Banner uploaded successfully!",
        })
      )
    } catch (error) {
      console.error(error)
      toast.error(
        t("sponsors.dialog.imageUploadFailed", {
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

  const startDateObj = parseDateString(formValues.startDate)
  const endDateObj = parseDateString(formValues.endDate)

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
                alt={tCommon("previewImageAlt")}
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="start-date"
                variant="outline"
                className={cn(
                  "mt-3 w-full justify-start text-left font-normal",
                  !startDateObj && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {startDateObj ? (
                  format(startDateObj, "dd/MM/yyyy")
                ) : (
                  <span>dd/mm/yyyy</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDateObj}
                onSelect={(date) => {
                  if (date) {
                    setFormValue("startDate", formatDateString(date))
                  }
                }}
                disabled={endDateObj ? (date) => date > endDateObj : undefined}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="end-date">{t("create.step1.endDateLabel")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="end-date"
                variant="outline"
                className={cn(
                  "mt-3 w-full justify-start text-left font-normal",
                  !endDateObj && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {endDateObj ? (
                  format(endDateObj, "dd/MM/yyyy")
                ) : (
                  <span>dd/mm/yyyy</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDateObj}
                onSelect={(date) => {
                  if (date) {
                    setFormValue("endDate", formatDateString(date))
                  }
                }}
                disabled={
                  startDateObj ? (date) => date < startDateObj : undefined
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
