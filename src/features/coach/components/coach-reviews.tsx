"use client"

import { Star } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { useCoachReviews, useMyCoachProfile } from "../hooks/use-coach-queries"

export function CoachReviews() {
  const { data: profile } = useMyCoachProfile()
  const coachId = profile?.id ?? ""

  const { data, isLoading } = useCoachReviews(coachId)

  if (!coachId || isLoading) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Đánh giá HLV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.reviews.length === 0) {
    return (
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
    )
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle>
          Đánh giá HLV
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({data.averageRating.toFixed(1)} sao · {data.reviewCount} đánh giá)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.reviews.map((review, index) => (
          <div
            key={review.reviewId ?? index}
            className="flex items-start gap-4 rounded-2xl border p-4"
          >
            <Avatar className="size-10">
              <AvatarImage
                src={review.reviewerProfile.avatar ?? ""}
                alt={review.reviewerProfile.name}
              />
              <AvatarFallback>
                {(review.reviewerProfile.name ?? "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">
                  {review.reviewerProfile.name}
                </p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground">
                  {review.comment}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
