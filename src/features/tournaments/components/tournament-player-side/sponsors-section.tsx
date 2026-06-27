"use client"

import { Trophy } from "lucide-react"
import Image from "next/image"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Sponsor } from "@/features/tournaments/types/sponsor"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

interface SponsorsSectionProps {
  sponsors: Sponsor[]
}

export function SponsorsSection({ sponsors }: SponsorsSectionProps) {
  const { t } = useTournamentTranslation()

  const sortedSponsors = [...sponsors].sort((a, b) => b.amount - a.amount)

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Trophy className="h-5 w-5 text-emerald-600" />
          {t("public.overview.sponsorsTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {sortedSponsors.map((sponsor, index) => {
            const isTop3 = index < 3
            const colors = [
              "from-amber-400 to-amber-600",
              "from-slate-400 to-slate-600",
              "from-orange-400 to-orange-600",
            ]
            const logoUrl = sponsor.logoUrl

            const content = (
              <>
                <div className="relative mb-3 flex h-20 w-20 items-center justify-center rounded-lg border border-gray-100 bg-white transition-all group-hover:scale-105 group-hover:border-emerald-500/50">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={sponsor.name}
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                      unoptimized
                    />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center rounded-lg bg-linear-to-br text-xl font-bold text-white shadow-sm ${
                        isTop3
                          ? colors[index]
                          : "from-emerald-400 to-emerald-600"
                      }`}
                    >
                      {sponsor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="line-clamp-1 text-sm font-bold text-gray-900 transition-colors group-hover:text-emerald-600">
                  {sponsor.name}
                </span>
                {isTop3 && (
                  <span className="mt-1.5 flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-800 uppercase">
                    {t("sponsors.topSponsor")}
                  </span>
                )}
              </>
            )

            if (sponsor.websiteUrl) {
              return (
                <a
                  key={sponsor.id}
                  href={sponsor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex flex-col items-center rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-sm ${
                    isTop3
                      ? "border-emerald-200 bg-emerald-50/10 shadow-sm shadow-emerald-50"
                      : "border-gray-150 bg-gray-50/30"
                  }`}
                >
                  {content}
                </a>
              )
            }

            return (
              <div
                key={sponsor.id}
                className={`flex flex-col items-center rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-sm ${
                  isTop3
                    ? "border-emerald-200 bg-emerald-50/10 shadow-sm shadow-emerald-50"
                    : "border-gray-150 bg-gray-50/30"
                }`}
              >
                {content}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
