"use client"

import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadImageAction } from "@/features/sport-center/actions/upload-image-action"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

interface AddSponsorFormProps {
  onAdd: (sponsor: {
    name: string
    amount: number
    logoUrl: string
    websiteUrl: string
  }) => Promise<void>
  onClose: () => void
}

export function AddSponsorForm({ onAdd, onClose }: AddSponsorFormProps) {
  const { t } = useTournamentTranslation()
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    price?: string
    websiteUrl?: string
  }>({})

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast.error(
          t("eventDetail.selectImageError", {
            defaultValue: "Please select an image file",
          })
        )
        return
      }
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleRemoveLogo = () => {
    setFile(null)
    setLogoPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { name?: string; price?: string; websiteUrl?: string } = {}

    if (!name.trim()) {
      newErrors.name = t("sponsors.dialog.validationName")
    }

    const rawPrice = price.replace(/\D/g, "")
    const priceNum = parseFloat(rawPrice)
    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = t("sponsors.dialog.validationPrice")
    }

    const cleanWebsiteUrl = websiteUrl.trim()
    if (cleanWebsiteUrl && !/^https?:\/\//i.test(cleanWebsiteUrl)) {
      newErrors.websiteUrl = t("sponsors.dialog.validationWebsiteUrl", {
        defaultValue:
          "Please enter a valid URL (starting with http:// or https://)",
      })
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      let logoUrl = ""
      if (file) {
        logoUrl = await uploadImageAction(file)
      }

      await onAdd({
        name: name.trim(),
        amount: priceNum,
        logoUrl,
        websiteUrl: cleanWebsiteUrl,
      })
    } catch (error) {
      console.error("Failed to add sponsor:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to add sponsor"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
      <div>
        <Label htmlFor="sponsor-name">{t("sponsors.dialog.nameLabel")}</Label>
        <Input
          id="sponsor-name"
          placeholder={t("sponsors.dialog.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          className={`mt-4 ${errors.name ? "border-red-500" : ""}`}
        />
        {errors.name && (
          <p className="mt-4 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="sponsor-price">{t("sponsors.dialog.priceLabel")}</Label>
        <div className="relative mt-4">
          <Input
            id="sponsor-price"
            type="text"
            inputMode="numeric"
            placeholder={t("sponsors.dialog.pricePlaceholder")}
            value={price}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\D/g, "")
              const formatted = rawValue
                ? Number(rawValue).toLocaleString("vi-VN")
                : ""
              setPrice(formatted)
            }}
            disabled={isSubmitting}
            className={`${errors.price ? "border-red-500" : ""}`}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-sm font-medium text-gray-500">VND</span>
          </div>
        </div>
        {errors.price && (
          <p className="mt-4 text-xs text-red-500">{errors.price}</p>
        )}
      </div>

      <div>
        <Label htmlFor="sponsor-website">
          {t("sponsors.dialog.websiteUrlLabel", {
            defaultValue: "Website URL (Optional)",
          })}
        </Label>
        <Input
          id="sponsor-website"
          placeholder={t("sponsors.dialog.websiteUrlPlaceholder", {
            defaultValue: "e.g., https://example.com",
          })}
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          disabled={isSubmitting}
          className={`mt-4 ${errors.websiteUrl ? "border-red-500" : ""}`}
        />
        {errors.websiteUrl && (
          <p className="mt-4 text-xs text-red-500">{errors.websiteUrl}</p>
        )}
      </div>

      <div>
        <Label>{t("sponsors.dialog.logoLabel")}</Label>
        <div className="mt-4 flex items-center gap-4">
          {logoPreview ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <Image
                src={logoPreview}
                alt="Logo preview"
                fill
                sizes="64px"
                className="object-contain p-1.5"
                unoptimized
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                disabled={isSubmitting}
                className="absolute top-0.5 right-0.5 rounded-full bg-gray-900/60 p-0.5 text-white hover:bg-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
              <Upload className="h-5 w-5 text-gray-400" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="hidden"
              />
            </label>
          )}
          <div className="flex-1 text-xs text-gray-500">
            <p className="font-semibold">
              {t("sponsors.dialog.logoUploadHint")}
            </p>
            <p>{t("sponsors.dialog.logoSizeHint")}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onClose}
        >
          {t("sponsors.dialog.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("common.saving", { defaultValue: "Saving..." })}
            </>
          ) : (
            t("sponsors.dialog.submit")
          )}
        </Button>
      </div>
    </form>
  )
}
