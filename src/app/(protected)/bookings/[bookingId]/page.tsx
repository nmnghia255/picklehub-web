"use client"

import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"
import { Calendar, Clock, MapPin, Shield, User } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { BackNavigation } from "@/components/common/back-navigation"
import { PageContainer } from "@/components/page-container"
import { ErrorState } from "@/components/shared/error-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLearnerSchedule } from "@/features/learner/hooks/use-learner-queries"
import { getErrorMessage } from "@/lib/api-client"

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  upcoming: "secondary",
  live: "default",
  past: "outline",
  pending: "secondary",
}

function BookingDetailSkeleton() {
  return (
    <PageContainer variant="wide" className="space-y-6 py-8">
      <Skeleton className="h-32 rounded-xl" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-40 rounded-xl" />
    </PageContainer>
  )
}

async function fetchSession() {
  try {
    const response = await fetch("/api/auth/session")

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch {
    return null
  }
}

export default function BookingDetailPage() {
  const params = useParams()
  const bookingId = params.bookingId as string
  const { t } = useTranslation("common")
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: Infinity,
  })

  const { data, isLoading, isError, error, refetch } = useLearnerSchedule(
    { kind: "booking", limit: 200, sort: "desc" },
    { enabled: !!session?.user }
  )

  const booking = useMemo(
    () => data?.data.find((item) => item.bookingId === bookingId) ?? null,
    [bookingId, data?.data]
  )

  const statusLabel: Record<string, string> = {
    upcoming: t("learner.bookingDetail.status.upcoming"),
    live: t("learner.bookingDetail.status.live"),
    past: t("learner.bookingDetail.status.past"),
    pending: t("learner.bookingDetail.status.pending"),
  }

  const paymentLabel: Record<string, string> = {
    PENDING_PROOF: t("learner.bookingDetail.paymentStatus.pendingProof"),
    PENDING_REVIEW: t("learner.bookingDetail.paymentStatus.pendingReview"),
    SETTLED: t("learner.bookingDetail.paymentStatus.settled"),
    REJECTED: t("learner.bookingDetail.paymentStatus.rejected"),
  }

  if (isSessionLoading || isLoading) {
    return <BookingDetailSkeleton />
  }

  if (isError) {
    return (
      <PageContainer variant="wide" className="py-8">
        <ErrorState
          title={t("learner.bookingDetail.errorTitle")}
          description={getErrorMessage(error)}
          retry={refetch}
        />
      </PageContainer>
    )
  }

  if (!booking) {
    return (
      <PageContainer variant="wide" className="space-y-6 py-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-lg font-medium">
              {t("learner.bookingDetail.notFoundTitle")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("learner.bookingDetail.notFoundDescription")}
            </p>
            <Button asChild>
              <Link href="/learner">
                {t("learner.bookingDetail.backButton")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  const coachName =
    booking.coachProfile?.displayName ??
    t("learner.bookingDetail.coachFallback")
  const isVerified = booking.coachProfile?.verificationStatus === "VERIFIED"

  return (
    <PageContainer variant="wide" className="space-y-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("learner.bookingDetail.pageTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("learner.bookingDetail.pageDescription")}
          </p>
        </div>
        <BackNavigation fallbackPath="/learner" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              {t("learner.bookingDetail.coachTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage
                src={booking.coachProfile?.avatarUrl ?? ""}
                alt={coachName}
              />
              <AvatarFallback>
                {coachName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold">{coachName}</p>
                {isVerified && (
                  <Badge variant="secondary" className="border-none">
                    <Shield className="mr-1 size-3.5" />
                    {t("learner.bookingDetail.verified")}
                  </Badge>
                )}
              </div>
              {booking.coachProfile?.locationCity && (
                <p className="text-sm text-muted-foreground">
                  {booking.coachProfile.locationCity}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("learner.bookingDetail.statusTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                {t("learner.bookingDetail.scheduleStatusLabel")}
              </span>
              <Badge variant={statusVariant[booking.status] ?? "outline"}>
                {statusLabel[booking.status] ?? booking.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                {t("learner.bookingDetail.paymentLabel")}
              </span>
              <span className="font-medium">
                {booking.paymentStatus
                  ? (paymentLabel[booking.paymentStatus] ??
                    booking.paymentStatus)
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            {t("learner.bookingDetail.sessionTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 rounded-lg border p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Clock className="size-4 text-muted-foreground" />
              {t("learner.bookingDetail.timeLabel")}
            </p>
            <p className="text-sm text-muted-foreground">
              {dayjs(booking.startsAt).format("DD/MM/YYYY HH:mm")}
              {" - "}
              {dayjs(booking.endsAt).format("HH:mm")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("learner.bookingDetail.durationLabel", {
                minutes: booking.durationMinutes,
              })}
            </p>
          </div>

          <div className="space-y-1 rounded-lg border p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="size-4 text-muted-foreground" />
              {t("learner.bookingDetail.locationLabel")}
            </p>
            <p className="text-sm text-muted-foreground">
              {booking.locationDescription ??
                t("learner.bookingDetail.noLocation")}
            </p>
          </div>

          <div className="space-y-1 rounded-lg border p-4 md:col-span-2">
            <p className="text-sm font-medium">
              {t("learner.bookingDetail.noteLabel")}
            </p>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {booking.note || t("learner.bookingDetail.noNote")}
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
