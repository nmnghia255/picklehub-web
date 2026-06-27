"use client"

import { Award, Trophy, Users } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

interface SponsorStatsProps {
  totalContributions: number
  activeSponsorsCount: number
  avgContribution: number
}

export function SponsorStats({
  totalContributions,
  activeSponsorsCount,
  avgContribution,
}: SponsorStatsProps) {
  const { t } = useTournamentTranslation()

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card className="border-emerald-100 bg-emerald-50/20">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">
              {t("sponsors.stats.totalContributions", {
                defaultValue: "Total Funding",
              })}
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              {totalContributions.toLocaleString("vi-VN")} VND
            </h3>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-100 bg-blue-50/20">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">
              {t("sponsors.stats.activeSponsors", {
                defaultValue: "Sponsors Count",
              })}
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              {activeSponsorsCount}
            </h3>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-100 bg-purple-50/20">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">
              {t("sponsors.stats.avgContribution", {
                defaultValue: "Avg. Contribution",
              })}
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              {avgContribution.toLocaleString("vi-VN")} VND
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
