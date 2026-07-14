"use client"

import { ImagePlus, Loader2, Send } from "lucide-react"
import { type ChangeEventHandler, useRef } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface MessageComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onUploadMedia: (file: File) => Promise<void>
  isSending: boolean
  disabled?: boolean
  maxLength?: number
}

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  onUploadMedia,
  isSending,
  disabled,
  maxLength = 4000,
}: MessageComposerProps) {
  const { t } = useTranslation("common")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const remaining = Math.max(0, maxLength - value.length)

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    await onUploadMedia(file)
    event.target.value = ""
  }

  return (
    <div className="border-t bg-background px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {t("chat.composer.hint")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("chat.composer.remaining", { count: remaining })}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSending}
          aria-label={t("chat.composer.uploadImage")}
        >
          <ImagePlus className="size-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, maxLength))}
          placeholder={t("chat.composer.placeholder")}
          className="min-h-24 flex-1 resize-none"
          disabled={disabled || isSending}
          maxLength={maxLength}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault()
              onSubmit()
            }
          }}
        />

        <Button
          type="button"
          onClick={onSubmit}
          disabled={disabled || isSending}
          className="shrink-0 self-end"
        >
          {isSending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Send className="mr-2 size-4" />
          )}
          {t("chat.composer.send")}
        </Button>
      </div>
    </div>
  )
}
