"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  submitLabel?: string
  onSubmit: (reason: string) => Promise<void>
}

export function CancelReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  onSubmit,
}: Props) {
  const { t } = useSportCenterManagementTranslation()
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dialogTitle = title ?? t("bookingList.dialog.title")
  const dialogDescription = description ?? t("bookingList.dialog.description")
  const dialogSubmitLabel = submitLabel ?? t("bookingList.dialog.confirm")

  const handleClose = () => {
    setReason("")
    setError(null)
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit(reason)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{dialogTitle}</h3>
          <p className="text-sm text-muted-foreground">{dialogDescription}</p>
          <Textarea
            value={reason}
            onChange={(e) => setReason((e.target as HTMLTextAreaElement).value)}
            placeholder={t("bookingList.dialog.placeholder")}
            rows={4}
          />

          {error ? <div className="text-sm text-rose-500">{error}</div> : null}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t("bookingList.dialog.close")}
            </Button>
            <Button
              onClick={handleSubmit}
              variant="destructive"
              disabled={isSubmitting}
            >
              {dialogSubmitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CancelReasonDialog
