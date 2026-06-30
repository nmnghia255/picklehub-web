"use client"

import { Star } from "lucide-react"
import { useMemo, useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { CoachReview } from "../data/mockReviews"
import { coachReviews } from "../data/mockReviews"

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const STAR_OPTIONS = [5, 4, 3, 2, 1]

interface CoachReviewsProps {
  coachId: string
}

export function CoachReviews({ coachId }: CoachReviewsProps) {
  const [filterStar, setFilterStar] = useState<number | null>(null)

  const filteredReviews = useMemo(() => {
    const coachSpecific = coachReviews.filter((r) => r.coachId === coachId)
    if (filterStar === null) return coachSpecific
    return coachSpecific.filter((r) => r.rating === filterStar)
  }, [coachId, filterStar])

  const averageRating = useMemo(() => {
    const coachSpecific = coachReviews.filter((r) => r.coachId === coachId)
    if (coachSpecific.length === 0) return 0
    const sum = coachSpecific.reduce((acc, r) => acc + r.rating, 0)
    return sum / coachSpecific.length
  }, [coachId])

  const ratingCounts = useMemo(() => {
    const coachSpecific = coachReviews.filter((r) => r.coachId === coachId)
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    coachSpecific.forEach((r) => {
      counts[r.rating] += 1
    })
    return counts
  }, [coachId])

  const totalReviews = coachReviews.filter((r) => r.coachId === coachId).length

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Đánh giá HLV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex shrink-0 flex-col items-center gap-2 md:w-48">
              <span className="text-5xl font-bold">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "size-5",
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {totalReviews} đánh giá
              </p>
            </div>

            <div className="flex-1 space-y-2">
              {STAR_OPTIONS.map((star) => {
                const count = ratingCounts[star]
                const percentage =
                  totalReviews > 0 ? (count / totalReviews) * 100 : 0
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setFilterStar(filterStar === star ? null : star)
                    }
                    className="flex w-full items-center gap-2 text-sm transition-opacity hover:opacity-80"
                  >
                    <span className="w-4 text-right font-medium">{star}</span>
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {filterStar !== null && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterStar(null)}
                className="text-xs text-muted-foreground"
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Chưa có đánh giá nào.
          </p>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>
    </div>
  )
}

function ReviewCard({ review }: { review: CoachReview }) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-xs font-semibold">
              {getInitials(review.authorName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{review.authorName}</p>
              <span className="text-xs text-muted-foreground">
                {formatDate(review.createdAt)}
              </span>
            </div>
            <div className="mt-0.5 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "size-3.5",
                    star <= review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {review.content}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {review.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="rounded-full text-xs"
                >
                  {skill}
                </Badge>
              ))}
              {review.strengths.length > 0 && (
                <span className="text-xs text-muted-foreground/60">·</span>
              )}
              {review.strengths.map((strength) => (
                <Badge
                  key={strength}
                  variant="outline"
                  className="rounded-full text-xs"
                >
                  {strength}
                </Badge>
              ))}
              <span className="text-xs text-muted-foreground/60">·</span>
              <span className="text-xs text-muted-foreground">
                {review.sessionType}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
