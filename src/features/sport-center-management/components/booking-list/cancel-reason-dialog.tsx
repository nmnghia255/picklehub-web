"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

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
  title = "Lý do hủy",
  description = "Vui lòng nhập lý do hủy.",
  submitLabel = "Xác nhận hủy",
  onSubmit,
}: Props) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          <Textarea
            value={reason}
            onChange={(e) => setReason((e.target as HTMLTextAreaElement).value)}
            placeholder="Lý do hủy..."
            rows={4}
          />

          {error ? <div className="text-sm text-rose-500">{error}</div> : null}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Đóng
            </Button>
            <Button
              onClick={handleSubmit}
              variant="destructive"
              disabled={isSubmitting}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CancelReasonDialog
