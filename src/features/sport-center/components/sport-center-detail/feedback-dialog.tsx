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

const RATING_OPTIONS = [5, 4, 3, 2, 1]

interface FeedbackDialogProps {
  centerId: string
  onCreated: (review: Review) => void
}

export function FeedbackDialog({ centerId, onCreated }: FeedbackDialogProps) {
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
      setError("Vui lòng nhập trải nghiệm của bạn.")
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
            ? payload.message || "Không thể gửi đánh giá."
            : "Không thể gửi đánh giá."
        )
      }

      const createdReview =
        payload && typeof payload === "object" && "data" in payload
          ? payload.data
          : (payload as Review)

      if (!createdReview || typeof createdReview !== "object") {
        throw new Error("Không thể gửi đánh giá.")
      }

      onCreated(createdReview)
      resetForm()
      setOpen(false)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể gửi đánh giá."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Thêm đánh giá</Button>
      </DialogTrigger>

      <DialogContent>
        <form ref={formRef} onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Chia sẻ trải nghiệm của bạn</DialogTitle>
            <DialogDescription>
              Đánh giá của bạn giúp người khác chọn sân phù hợp hơn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Điểm đánh giá</p>
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
              <p className="text-sm font-medium">Trải nghiệm của bạn</p>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Hãy kể ngắn gọn về chất lượng sân, dịch vụ, vệ sinh, hoặc điều bạn thích nhất."
                className="min-h-32"
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
