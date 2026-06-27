"use client"

import { Loader2, Upload, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { uploadImageAction } from "@/features/sport-center/actions/upload-image-action"
import { uploadPaymentProofAction } from "@/features/tournaments/actions/tournament-registration-actions"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

interface PaymentProofDialogProps {
  tournamentId: string
  registrationId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PaymentProofDialog({
  tournamentId,
  registrationId,
  isOpen,
  onOpenChange,
  onSuccess,
}: PaymentProofDialogProps) {
  const { t } = useTournamentTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl("")
      }
    }
  }, [isOpen, previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast.error(t("eventDetail.selectImageError"))
        return
      }
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error(t("eventDetail.noImageSelectedError"))
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Upload to media server
      const imageUrl = await uploadImageAction(file)

      // 2. Upload payment proof to registration service
      const res = await uploadPaymentProofAction(
        tournamentId,
        registrationId,
        imageUrl
      )

      if (res.success) {
        toast.success(t("eventDetail.uploadSuccess"))
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(res.error || t("eventDetail.uploadFailure"))
      }
    } catch (err: unknown) {
      console.error(err)
      toast.error(
        err instanceof Error ? err.message : t("eventDetail.uploadImageError")
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            {t("eventDetail.uploadProofTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("eventDetail.uploadProofDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-3">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-4">
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              {!previewUrl ? (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2">
                  <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {t("eventDetail.clickToSelect")}
                  </span>
                  <span className="text-xs text-gray-400">
                    {t("eventDetail.sizeLimitHint")}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                    required
                  />
                </label>
              ) : (
                <div className="relative w-full overflow-hidden rounded-xl border bg-white p-2">
                  <img
                    src={previewUrl}
                    alt={t("eventDetail.previewAlt")}
                    className="max-h-[220px] w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 rounded-full bg-gray-900/60 p-1.5 text-white transition-colors hover:bg-gray-900/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between rounded-xl border bg-gray-50 p-3 text-sm">
              <span className="truncate font-medium text-gray-700">
                {file.name}
              </span>
              <span className="ml-2 shrink-0 text-xs text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              {t("eventDetail.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !file}
              className="bg-emerald-600 font-bold text-white hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("eventDetail.uploading")}
                </>
              ) : (
                t("eventDetail.confirmUpload")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
