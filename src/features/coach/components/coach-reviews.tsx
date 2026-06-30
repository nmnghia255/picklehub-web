"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CoachReviewsProps {
  coachId: string
}

export function CoachReviews({ coachId }: CoachReviewsProps) {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Đánh giá HLV</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Chưa có đánh giá nào.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
