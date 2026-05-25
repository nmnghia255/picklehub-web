import { Star } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { Review } from "@/features/sport-center/types/review"

interface FeedbackTabProps {
  reviews: Review[]
}

export function FeedbackTab({ reviews }: FeedbackTabProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">Đánh giá</h2>
        <div className="space-y-3">
          {reviews.length > 0 ? (
            reviews.map((entry) => (
              <div key={entry.id} className="rounded-lg border p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium">
                    Người dùng {entry.userId.slice(0, 8)}
                  </p>
                  <p className="flex items-center gap-1 text-sm">
                    <Star className="size-4 fill-current" />
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
              Chưa có đánh giá nào.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
