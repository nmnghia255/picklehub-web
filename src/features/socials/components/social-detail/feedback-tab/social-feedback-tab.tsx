"use client"

import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { AlertCircle, CheckCircle2, Star } from "lucide-react"
import React, { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  getFeedbackAction,
  submitFeedbackAction,
} from "@/features/socials/actions/social"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface SocialFeedbackTabProps {
  socialId: string
  isHost?: boolean
}

export default function SocialFeedbackTab({
  socialId,
  isHost = false,
}: SocialFeedbackTabProps) {
  const { t } = useSocialsTranslation()

  // Form states
  const [overallRating, setOverallRating] = useState<number>(0)
  const [hostRating, setHostRating] = useState<number>(0)
  const [venueRating, setVenueRating] = useState<number>(0)
  const [comment, setComment] = useState<string>("")

  // Interaction states
  const [hoveredOverall, setHoveredOverall] = useState<number>(0)
  const [hoveredHost, setHoveredHost] = useState<number>(0)
  const [hoveredVenue, setHoveredVenue] = useState<number>(0)

  // Dialog & Submission states
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Fetch feedback data
  const {
    data: feedbackData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["socialFeedback", socialId],
    queryFn: () => getFeedbackAction(socialId),
    enabled: !!socialId,
  })
  const comments = Array.isArray(feedbackData?.comments)
    ? feedbackData.comments
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (overallRating === 0) {
      setErrorMessage(t("feedback.errorEmptyRating"))
      return
    }

    if (!comment.trim()) {
      setErrorMessage(t("feedback.errorEmptyComment"))
      return
    }

    setIsSubmitting(true)
    try {
      await submitFeedbackAction(
        socialId,
        overallRating,
        hostRating,
        venueRating,
        comment
      )
      setIsDialogOpen(true)
      refetch()
    } catch (err: unknown) {
      console.error(err)
      const msg =
        err instanceof Error ? err.message : t("feedback.submitFailed")
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setOverallRating(0)
    setHostRating(0)
    setVenueRating(0)
    setComment("")
  }

  // Helper component to render stars for a rating type
  const renderStarRating = (
    rating: number,
    setRating: (v: number) => void,
    hovered: number,
    setHovered: (v: number) => void
  ) => {
    return (
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 5 }).map((_, index) => {
          const starValue = index + 1
          const isActive = starValue <= (hovered || rating)
          return (
            <button
              key={index}
              type="button"
              className="group relative cursor-pointer p-0.5 transition-transform outline-none hover:scale-110 active:scale-95"
              onClick={() => setRating(starValue)}
              onMouseEnter={() => setHovered(starValue)}
              onMouseLeave={() => setHovered(0)}
            >
              <Star
                className={`size-7 transition-colors duration-200 ${
                  isActive
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]"
                    : "text-muted-foreground/45 group-hover:text-muted-foreground/80"
                }`}
              />
            </button>
          )
        })}
      </div>
    )
  }

  const renderReadOnlyStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => {
          const isActive = index < rating
          return (
            <Star
              key={index}
              className={`size-4 ${isActive ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Feedback Form */}
      {!isHost && (
        <div className="w-full">
          <Card className="w-full gap-0 border-primary/10 bg-linear-to-br from-background via-background to-primary/5 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t("feedback.title")}
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-muted-foreground">
                {t("feedback.subtitle")}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Ratings Grid */}
                <div className="space-y-5 rounded-2xl border border-border/60 bg-card p-5">
                  {/* Overall Experience */}
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {t("feedback.overallExperience")}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {t("feedback.overallDesc")}
                      </p>
                    </div>
                    {renderStarRating(
                      overallRating,
                      setOverallRating,
                      hoveredOverall,
                      setHoveredOverall
                    )}
                  </div>

                  <div className="h-px bg-border/60" />

                  {/* Host Organization */}
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {t("feedback.hostOrganization")}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {t("feedback.hostDesc")}
                      </p>
                    </div>
                    {renderStarRating(
                      hostRating,
                      setHostRating,
                      hoveredHost,
                      setHoveredHost
                    )}
                  </div>

                  <div className="h-px bg-border/60" />

                  {/* Venue Quality */}
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {t("feedback.venueQuality")}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {t("feedback.venueDesc")}
                      </p>
                    </div>
                    {renderStarRating(
                      venueRating,
                      setVenueRating,
                      hoveredVenue,
                      setHoveredVenue
                    )}
                  </div>
                </div>

                {/* Comments Textarea */}
                <div className="space-y-2">
                  <label
                    htmlFor="comment"
                    className="text-sm font-semibold text-foreground"
                  >
                    {t("feedback.commentLabel")}
                  </label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t("feedback.commentPlaceholder")}
                    className="min-h-[120px] resize-none rounded-2xl border-border bg-card/60 focus:bg-card focus:ring-1 focus:ring-primary/40"
                  />
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full px-8 font-semibold sm:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? t("common.submitting")
                      : t("feedback.submitBtn")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Other Participant Reviews */}
      <div className="w-full">
        <Card className="w-full gap-0 shadow-sm backdrop-blur">
          <CardHeader className="pb-0">
            <div>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {t("feedback.othersTitle")}
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                {t("feedback.othersSubtitle")}
              </CardDescription>

              {/* Average Rating Summary Overview */}
              {feedbackData?.average &&
                feedbackData.average.totalReviews > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 sm:grid-cols-3">
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <span className="text-xs text-muted-foreground">
                        {t("feedback.overallExperience")}
                      </span>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-lg font-bold">
                          {feedbackData.average.ratingOverall?.toFixed(1) ??
                            "N/A"}
                        </span>
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center border-border/40 p-2 text-center sm:border-x sm:border-t-0">
                      <span className="text-xs text-muted-foreground">
                        {t("feedback.hostOrganization")}
                      </span>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-lg font-bold">
                          {feedbackData.average.ratingOrganization?.toFixed(
                            1
                          ) ?? "N/A"}
                        </span>
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center border-t p-2 text-center sm:border-t-0">
                      <span className="text-xs text-muted-foreground">
                        {t("feedback.venueQuality")}
                      </span>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-lg font-bold">
                          {feedbackData.average.ratingVenue?.toFixed(1) ??
                            "N/A"}
                        </span>
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            {isLoading ? (
              <div className="space-y-3 py-4">
                <div className="h-6 w-1/3 animate-pulse rounded-md bg-muted" />
                <div className="h-20 animate-pulse rounded-xl bg-muted" />
                <div className="h-20 animate-pulse rounded-xl bg-muted" />
              </div>
            ) : comments.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {t("feedback.noReviewsYet")}
              </div>
            ) : (
              comments.map((commentItem, idx) => (
                <div
                  key={commentItem.id || idx}
                  className="group relative flex flex-col gap-2 rounded-2xl border p-4 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8.5 border border-border/80">
                        <AvatarImage
                          src={commentItem.userAvatarUrl ?? undefined}
                          alt={commentItem.userName ?? ""}
                        />
                        <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
                          {commentItem.userName
                            ? commentItem.userName.slice(0, 2).toUpperCase()
                            : "P"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {commentItem.userName ||
                            t("feedback.anonymousPlayer")}
                        </p>
                        {commentItem.createdAt && (
                          <p
                            className="text-xs text-muted-foreground"
                            suppressHydrationWarning
                          >
                            {format(
                              new Date(commentItem.createdAt),
                              "MMM d, yyyy"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    {renderReadOnlyStars(commentItem.ratingOverall)}
                  </div>
                  <p className="pt-1 pl-1 text-sm leading-relaxed text-muted-foreground">
                    {commentItem.comment}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submission Success Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center pt-4 text-center">
            <div className="mb-3 animate-bounce rounded-full bg-emerald-500/10 p-3 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <CheckCircle2 className="size-10" />
            </div>
            <DialogTitle className="text-lg font-bold">
              {t("feedback.dialogTitle")}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-muted-foreground">
              {t("feedback.dialogDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2 sm:justify-center">
            <Button type="button" onClick={handleCloseDialog} className="px-6">
              {t("feedback.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
