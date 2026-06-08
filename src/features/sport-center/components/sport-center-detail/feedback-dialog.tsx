"use client"

import { Star } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { Review } from "@/features/sport-center/types/review"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

const RATING_OPTIONS = [5, 4, 3, 2, 1]

interface FeedbackDialogProps {
  centerId: string
  onCreated: (review: Review) => void
}

export function FeedbackDialog({ centerId, onCreated }: FeedbackDialogProps) {
  const { t } = useSportCenterTranslation()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const resetForm = () => {
    setRating(5)
    setComment("")
    setError(null)
    formRef.current?.reset()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const trimmedComment = comment.trim()

    if (!trimmedComment) {
      setError(t("detail.feedback.errorEmptyComment"))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/sport-centers/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          centerId,
          rating,
          comment: trimmedComment,
        }),
      })

      const payload = (await response.json()) as
        | { success?: boolean; data?: Review; message?: string }
        | Review

      if (!response.ok) {
        throw new Error(
          typeof payload === "object" && payload && "message" in payload
            ? payload.message || t("detail.feedback.errorSubmit")
            : t("detail.feedback.errorSubmit")
        )
      }

      const createdReview =
        payload && typeof payload === "object" && "data" in payload
          ? payload.data
          : (payload as Review)

      if (!createdReview || typeof createdReview !== "object") {
        throw new Error(t("detail.feedback.errorSubmit"))
      }

      onCreated(createdReview)
      resetForm()
      setOpen(false)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : t("detail.feedback.errorSubmit")
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("detail.feedback.addReview")}</Button>
      </DialogTrigger>

      <DialogContent>
        <form ref={formRef} onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("detail.feedback.dialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("detail.feedback.dialogDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {t("detail.feedback.ratingLabel")}
              </p>
              <div className="flex flex-wrap gap-2">
                {RATING_OPTIONS.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={rating === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRating(value)}
                  >
                    <Star className="size-4" />
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                {t("detail.feedback.commentLabel")}
              </p>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={t("detail.feedback.commentPlaceholder")}
                className="min-h-32"
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("detail.feedback.submitting")
                : t("detail.feedback.submitBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
