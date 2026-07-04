"use client"

import { Activity, Calendar, MapPin, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

interface MetricsCardsProps {
  liveCount: number
  upcomingCount: number
  occupiedCourts: number
  totalCourts: number
  checkedInCount: number
}

export function MetricsCards({
  liveCount,
  upcomingCount,
  occupiedCourts,
  totalCourts,
  checkedInCount,
}: MetricsCardsProps) {
  const { t } = useTournamentTranslation()

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      {/* Live Matches */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <Activity className="h-5 w-5 text-yellow-600" />
            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
              {t("liveControl.metrics.liveBadge", { defaultValue: "Live" })}
            </Badge>
          </div>
          <div className="mb-1 text-3xl font-semibold text-gray-900">
            {liveCount}
          </div>
          <div className="text-sm text-gray-600">
            {t("liveControl.metrics.activeMatches", {
              defaultValue: "Active Matches",
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Matches */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <Calendar className="h-5 w-5 text-blue-600" />
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              {t("liveControl.metrics.upcomingBadge", {
                defaultValue: "Upcoming",
              })}
            </Badge>
          </div>
          <div className="mb-1 text-3xl font-semibold text-gray-900">
            {upcomingCount}
          </div>
          <div className="text-sm text-gray-600">
            {t("liveControl.metrics.upcomingMatches", {
              defaultValue: "Scheduled Queue",
            })}
          </div>
        </CardContent>
      </Card>

      {/* Courts in Use */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              {t("liveControl.metrics.courtsBadge", {
                defaultValue: "Courts",
              })}
            </Badge>
          </div>
          <div className="mb-1 text-3xl font-semibold text-gray-900">
            {occupiedCourts}/{totalCourts}
          </div>
          <div className="text-sm text-gray-600">
            {t("liveControl.metrics.courtsInUse", {
              defaultValue: "Courts in Use",
            })}
          </div>
        </CardContent>
      </Card>

      {/* Checked-in Players */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <Users className="h-5 w-5 text-purple-600" />
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
              {t("liveControl.metrics.playersBadge", {
                defaultValue: "Players",
              })}
            </Badge>
          </div>
          <div className="mb-1 text-3xl font-semibold text-gray-900">
            {checkedInCount}
          </div>
          <div className="text-sm text-gray-600">
            {t("liveControl.metrics.checkedInPlayers", {
              defaultValue: "Checked-in Players",
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
