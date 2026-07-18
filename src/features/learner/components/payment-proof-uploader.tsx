"use client"

import { ImagePlus, Loader2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MediaService } from "@/features/sport-center/api/media-service"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

type PaymentProofUploaderProps = {
  value: string
  onChange: (url: string) => void
  onUploadingChange?: (uploading: boolean) => void
}

export function PaymentProofUploader({
  value,
  onChange,
  onUploadingChange,
}: PaymentProofUploaderProps) {
  const { t } = useTranslation("common")
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const setUploadingState = (next: boolean) => {
    setUploading(next)
    onUploadingChange?.(next)
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setError(null)
    if (!file.type.startsWith("image/")) {
      setError(t("learner.upload.invalidImage"))
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t("learner.upload.imageTooLarge"))
      return
    }

    const nextPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(nextPreviewUrl)
    setUploadingState(true)
    try {
      const uploadedUrl = await MediaService.uploadImage(file)
      onChange(uploadedUrl)
      setPreviewUrl(null)
    } catch {
      setError(t("learner.upload.uploadError"))
    } finally {
      setUploadingState(false)
    }
  }

  const handleRemove = () => {
    setError(null)
    setPreviewUrl(null)
    onChange("")
    if (inputRef.current) inputRef.current.value = ""
  }

  const displayedPreview = previewUrl ?? value

  return (
    <div className="space-y-3">
      {displayedPreview ? (
        <div className="relative w-fit">
          <img
            src={displayedPreview}
            alt={t("learner.upload.previewAlt")}
            className="h-40 w-40 rounded-xl border object-cover"
          />
          {!uploading && (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute -top-2 -right-2 rounded-full"
              onClick={handleRemove}
              aria-label={t("learner.upload.remove")}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      ) : null}

      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-sm hover:bg-muted/40">
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImagePlus className="size-4" />
        )}
        <span>
          {uploading
            ? t("learner.upload.uploading")
            : value
              ? t("learner.upload.replace")
              : t("learner.upload.choose")}
        </span>
        <Input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
      <p className="text-xs text-muted-foreground">
        {t("learner.upload.imageHint")}
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
