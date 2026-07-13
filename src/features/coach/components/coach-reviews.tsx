"use client"

import { Star } from "lucide-react"
import { useTranslation } from "react-i18next"

import { ErrorState } from "@/components/shared/error-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/features/auth/hooks/use-session"
import { getErrorMessage } from "@/lib/api-client"

import { useCoachReviews, useMyCoachProfile } from "../hooks/use-coach-queries"

export function CoachReviews() {
  const { t, i18n } = useTranslation("common")
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US"
  const session = useSession()
  const {
    data: profile,
    isError: profileError,
    error: profileErr,
    refetch: profileRefetch,
  } = useMyCoachProfile({ enabled: !!session?.user })
  const coachId = profile?.id ?? ""

  const { data, isLoading, isError, error, refetch } = useCoachReviews(coachId)

  if (profileError) {
    return (
      <ErrorState
        title={t("coach.reviews.coachErrorTitle")}
        description={getErrorMessage(profileErr)}
        retry={profileRefetch}
      />
    )
  }

  if (isError) {
    return (
      <ErrorState
        title={t("coach.reviews.errorTitle")}
        description={getErrorMessage(error)}
        retry={refetch}
      />
    )
  }

  if (!coachId || isLoading) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>{t("coach.reviews.loadingTitle")}</CardTitle>
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
          <CardTitle>{t("coach.reviews.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("coach.reviews.noReviews")}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle>
          {t("coach.reviews.title")}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {t("coach.reviews.ratingInfo", {
              rating: data.averageRating.toFixed(1),
              count: data.reviewCount,
            })}
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
                {new Date(review.createdAt).toLocaleDateString(locale)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
