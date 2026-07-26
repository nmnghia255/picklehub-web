"use client"

import { Star } from "lucide-react"
import { useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import type { Review } from "@/features/sport-center/types/review"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

import { FeedbackDialog } from "./feedback-dialog"

interface FeedbackTabProps {
  reviews: Review[]
  centerId: string
}

export function FeedbackTab({ reviews, centerId }: FeedbackTabProps) {
  const { t } = useSportCenterTranslation()
  const [reviewList, setReviewList] = useState(reviews)

  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">
            {t("detail.feedback.title")}
          </h2>
          <FeedbackDialog
            centerId={centerId}
            onCreated={(review) =>
              setReviewList((current) => [review, ...current])
            }
          />
        </div>

        <div className="space-y-3">
          {reviewList.length > 0 ? (
            reviewList.map((entry) => (
              <div key={entry.id} className="rounded-lg border p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium">
                    {t("detail.feedback.user", {
                      id: entry.userName,
                    })}
                  </p>
                  <p className="flex items-center gap-1 text-sm">
                    <Star className="size-4 fill-yellow-500 text-yellow-500" />
                    {entry.rating.toFixed(1)}
                  </p>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  {entry.comment}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("detail.feedback.noReviews")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
