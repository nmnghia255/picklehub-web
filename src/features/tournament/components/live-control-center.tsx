import { Activity, Calendar, MapPin, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  announcements,
  courtStatus,
  liveMatches,
  upcomingMatches,
} from "../mock-data/live-control-center"

export function LiveControlCenter() {
  const { t } = useTournamentTranslation()
  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <Activity className="h-8 w-8 animate-pulse text-red-500" />
            <h1 className="text-3xl font-semibold text-gray-900">
              {t("liveControl.title")}
            </h1>
          </div>
          <p className="text-gray-600">{t("liveControl.subtitle")}</p>
        </div>

        {/* Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <Activity className="h-5 w-5 text-yellow-600" />
                <Badge className="bg-yellow-100 text-yellow-700">
                  {t("liveControl.metrics.liveBadge")}
                </Badge>
              </div>
              <div className="mb-1 text-3xl font-semibold text-gray-900">4</div>
              <div className="text-sm text-gray-600">
                {t("liveControl.metrics.activeMatches")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Calendar className="mb-2 h-5 w-5 text-blue-600" />
              <div className="mb-1 text-3xl font-semibold text-gray-900">
                12
              </div>
              <div className="text-sm text-gray-600">
                {t("liveControl.metrics.upcomingMatches")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <MapPin className="mb-2 h-5 w-5 text-emerald-600" />
              <div className="mb-1 text-3xl font-semibold text-gray-900">
                3/8
              </div>
              <div className="text-sm text-gray-600">
                {t("liveControl.metrics.availableCourts")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Users className="mb-2 h-5 w-5 text-purple-600" />
              <div className="mb-1 text-3xl font-semibold text-gray-900">
                142
              </div>
              <div className="text-sm text-gray-600">
                {t("liveControl.metrics.checkedInPlayers")}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Live Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                {t("liveControl.liveMatches.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveMatches.map((match) => (
                  <div
                    key={match.id}
                    className="rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <Badge className="mb-2 bg-yellow-600 text-white">
                          {match.court}
                        </Badge>
                        <div className="text-sm font-medium text-gray-900">
                          {match.event}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-yellow-600">
                          {match.score}
                        </div>
                        <div className="text-xs text-gray-500">
                          {match.time}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      {typeof match.team1 === "object"
                        ? match.team1?.name
                        : match.team1}{" "}
                      <span className="text-gray-400">
                        {t("liveControl.liveMatches.vs")}
                      </span>{" "}
                      {typeof match.team2 === "object"
                        ? match.team2?.name
                        : match.team2}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Match Queue */}
          <Card>
            <CardHeader>
              <CardTitle>{t("liveControl.matchQueue.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-start gap-3 rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {match.court}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {match.time}
                        </span>
                      </div>
                      <div className="mb-1 text-sm font-medium text-gray-900">
                        {match.event}
                      </div>
                      <div className="text-xs text-gray-600">
                        {typeof match.team1 === "object"
                          ? match.team1?.name
                          : match.team1}{" "}
                        vs{" "}
                        {typeof match.team2 === "object"
                          ? match.team2?.name
                          : match.team2}
                      </div>
                    </div>
                    <Badge
                      className={
                        match.status === "ready"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {match.status === "ready"
                        ? t("liveControl.matchQueue.ready")
                        : t("liveControl.matchQueue.waiting")}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Court Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t("liveControl.courtStatus.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {courtStatus.map((court) => (
                  <div
                    key={court.id}
                    className={`rounded-lg border-2 p-4 ${
                      court.status === "occupied"
                        ? "border-red-200 bg-red-50"
                        : court.status === "available"
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-semibold text-gray-900">
                        {court.name}
                      </div>
                      <div
                        className={`h-3 w-3 rounded-full ${
                          court.status === "occupied"
                            ? "bg-red-500"
                            : court.status === "available"
                              ? "bg-emerald-500"
                              : "bg-gray-400"
                        }`}
                      />
                    </div>
                    {court.match && (
                      <>
                        <div className="mb-1 text-xs text-gray-600">
                          {court.match}
                        </div>
                        <div className="text-xs text-gray-500">
                          {court.timeRemaining}
                        </div>
                      </>
                    )}
                    {court.status === "available" && (
                      <div className="text-xs font-medium text-emerald-600">
                        {t("liveControl.courtStatus.available")}
                      </div>
                    )}
                    {court.status === "maintenance" && (
                      <div className="text-xs font-medium text-gray-600">
                        {t("liveControl.courtStatus.maintenance")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle>{t("liveControl.announcements.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`rounded-lg border p-4 ${
                      announcement.type === "warning"
                        ? "border-yellow-200 bg-yellow-50"
                        : announcement.type === "update"
                          ? "border-blue-200 bg-blue-50"
                          : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="mb-1 text-sm text-gray-900">
                      {announcement.message}
                    </div>
                    <div className="text-xs text-gray-500">
                      {announcement.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
