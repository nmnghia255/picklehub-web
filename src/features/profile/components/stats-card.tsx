"use client"

import { useProfileTranslation } from "@/i18n/use-profile-translation"

interface StatsCardProps {
  totalMatches: number
  wins: number
  losses: number
  winRate: number
}

export function StatsCard({
  totalMatches,
  wins,
  losses,
  winRate,
}: StatsCardProps) {
  const { t } = useProfileTranslation()

  return (
    <>
      {/* Match Stats */}
      <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow">
        <h3 className="mb-4 font-semibold">{t("stats")}</h3>
        <div className="mb-4 grid grid-cols-4 text-center">
          <div>
            <p className="text-xl font-bold">{totalMatches}</p>
            <p className="text-muted-foreground">{t("matchesPlayed")}</p>
          </div>
          <div>
            <p className="text-xl font-bold">{wins}</p>
            <p className="text-muted-foreground">{t("wins")}</p>
          </div>
          <div>
            <p className="text-xl font-bold">{losses}</p>
            <p className="text-muted-foreground">{t("losses")}</p>
          </div>
          <div>
            <p className="text-xl font-bold">{winRate}%</p>
            <p className="text-muted-foreground">{t("winRate")}</p>
          </div>
        </div>
      </div>
    </>
  )
}
