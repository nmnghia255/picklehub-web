import { Clock, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  events,
  recentActivities,
  stats,
  upcomingMatches,
} from "../mock-data/tournament-dashboard"

export function TournamentDashboard() {
  const { t } = useTournamentTranslation()
  return (
    <div className="mx-auto max-w-7xl p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-gray-900">
          {t("dashboard.title")}
        </h1>
        <p className="text-gray-600">{t("dashboard.subtitle")}</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  {Icon && <Icon className="h-5 w-5 text-gray-400" />}
                  {stat.trend === "up" && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <TrendingUp className="h-3 w-3" />
                      {stat.change}
                    </span>
                  )}
                </div>
                <div className="mb-1 text-2xl font-semibold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Registration Progress */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.registrationProgress")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.map((event) => (
              <div key={event.name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {event.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {event.participants ?? 0}/{event.capacity}
                    </span>
                    {event.status === "full" && (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        {t("dashboard.full")}
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress
                  value={((event.participants ?? 0) / event.capacity) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tournament Lifecycle */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.tournamentLifecycle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TimelineItem
                title={t("dashboard.lifecycle.registration")}
                status="completed"
                date="May 1 - June 10"
              />
              <TimelineItem
                title={t("dashboard.lifecycle.seedingAndScheduling")}
                status="completed"
                date="June 11 - June 14"
              />
              <TimelineItem
                title={t("dashboard.lifecycle.inProgress")}
                status="active"
                date="June 15 - June 17"
              />
              <TimelineItem
                title={t("dashboard.lifecycle.finalsAndAwards")}
                status="upcoming"
                date="June 17, 4:00 PM"
              />
              <TimelineItem
                title={t("dashboard.lifecycle.postEventReports")}
                status="upcoming"
                date="June 18 - June 20"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Matches */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.upcomingMatches")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-start gap-4 border-b pb-4 last:border-0"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-emerald-50">
                      <div className="text-xs font-medium text-emerald-600">
                        {match.court}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="h-3 w-3" />
                        {match.time}
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 text-sm font-medium text-gray-900">
                      {match.event}
                    </div>
                    <div className="text-sm text-gray-600">
                      {typeof match.team1 === "object"
                        ? match.team1?.name
                        : match.team1}{" "}
                      <span className="text-gray-400">{t("dashboard.vs")}</span>{" "}
                      {typeof match.team2 === "object"
                        ? match.team2?.name
                        : match.team2}
                    </div>
                  </div>
                  {match.status === "in_progress" && (
                    <Badge className="flex-shrink-0 bg-yellow-100 text-yellow-700">
                      {t("dashboard.live")}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentActivities")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 border-b pb-4 last:border-0"
                >
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TimelineItem({
  title,
  status,
  date,
}: {
  title: string
  status: "completed" | "active" | "upcoming"
  date: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`h-3 w-3 rounded-full border-2 ${
            status === "completed"
              ? "border-emerald-600 bg-emerald-600"
              : status === "active"
                ? "animate-pulse border-yellow-400 bg-yellow-400"
                : "border-gray-300 bg-white"
          }`}
        />
        <div className="mt-1 h-full w-px bg-gray-200" />
      </div>
      <div className="flex-1 pb-4">
        <div
          className={`font-medium ${
            status === "active" ? "text-gray-900" : "text-gray-700"
          }`}
        >
          {title}
        </div>
        <div className="mt-1 text-sm text-gray-500">{date}</div>
      </div>
    </div>
  )
}
