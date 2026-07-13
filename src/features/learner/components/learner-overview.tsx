"use client"

import {
  BadgeCheck,
  BookOpen,
  Calendar,
  Clock,
  Star,
  TrendingUp,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/features/auth/hooks/use-session"
import { useLearnerSchedule } from "@/features/learner/hooks/use-learner-queries"

function getLocaleCode(language: string) {
  return language.startsWith("vi") ? "vi-VN" : "en-US"
}

function formatDateTime(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function LearnerOverview() {
  const { t, i18n } = useTranslation("common")
  const session = useSession()
  const locale = getLocaleCode(i18n.language)
  const { data, isLoading, error } = useLearnerSchedule(
    { limit: 5, sort: "asc" },
    { enabled: !!session?.user }
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-destructive">{t("learner.overview.errorTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("learner.overview.errorDescription")}
          </p>
        </CardContent>
      </Card>
    )
  }

  const summary = data?.summary
  const upcomingItems =
    data?.data?.filter(
      (item) => item.status === "upcoming" || item.status === "live"
    ) ?? []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="size-4" />
              {t("learner.overview.totalSessions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BookOpen className="size-4" />
              {t("learner.overview.classes")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.classCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Star className="size-4" />
              {t("learner.overview.privateBookings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.bookingCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="size-4" />
              {t("learner.overview.upcomingSessions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {summary?.upcomingCount ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BadgeCheck className="size-4" />
              {t("learner.overview.coaches")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summary?.distinctCoachCount ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="size-5" />
            {t("learner.overview.upcomingTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="mb-2 size-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                {t("learner.overview.noUpcomingSessions")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingItems.map((item, idx) => (
                <div
                  key={item.id ?? `upcoming-${idx}`}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{item.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-3.5" />
                      <span>{formatDateTime(item.startsAt, locale)}</span>
                      <span className="text-xs">
                        (
                        {Math.round(
                          (new Date(item.endsAt).getTime() -
                            new Date(item.startsAt).getTime()) /
                            60000
                        )}{" "}
                        {t("learner.overview.minutes")})
                      </span>
                    </div>
                    {item.coachProfile && (
                      <p className="text-sm text-muted-foreground">
                        {t("learner.overview.coachLabel", {
                          name: item.coachProfile.displayName,
                        })}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={item.status === "live" ? "default" : "secondary"}
                  >
                    {item.status === "live"
                      ? t("learner.overview.live")
                      : t("learner.overview.upcoming")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
