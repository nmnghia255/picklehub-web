"use client"

import { Calendar, Loader2, Trophy, Users } from "lucide-react"
import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchSportCenterByIdAction } from "@/features/sport-center/actions/fetch-sport-center-by-id"
import type { SportCenter } from "@/features/sport-center/types/sport-center"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { getDateOnly } from "@/utils/time-helper"

import { getTournamentCentersAction } from "../../../actions/booking-actions"
import type { Sponsor as TournamentSponsor } from "../../../types/sponsor"
import type { Tournament } from "../../../types/tournament"
import type { TournamentCenter } from "../../../types/tournament-center"
import { SponsorsSection } from "./sponsors-section"

interface TournamentOverviewProps {
  tournament?: Tournament
  participantsCount: number
  eventsCount: number
  totalPrizes?: number
  sponsors?: TournamentSponsor[]
}

export function TournamentOverview({
  tournament,
  participantsCount,
  eventsCount,
  totalPrizes = 0,
  sponsors,
}: TournamentOverviewProps) {
  const { t } = useTournamentTranslation()
  const [sportCenters, setSportCenters] = useState<SportCenter[]>([])
  const [isLoading, setIsLoading] = useState(!!tournament?.id)

  useEffect(() => {
    if (!tournament?.id) return

    getTournamentCentersAction(String(tournament.id)).then(async (res) => {
      if (res.success && res.data) {
        const rawCenters = res.data
        const centersArray = Array.isArray(rawCenters)
          ? rawCenters
          : rawCenters &&
              typeof rawCenters === "object" &&
              "centers" in rawCenters &&
              Array.isArray((rawCenters as Record<string, unknown>).centers)
            ? ((rawCenters as Record<string, unknown>)
                .centers as TournamentCenter[])
            : rawCenters &&
                typeof rawCenters === "object" &&
                "data" in rawCenters &&
                Array.isArray((rawCenters as Record<string, unknown>).data)
              ? ((rawCenters as Record<string, unknown>)
                  .data as TournamentCenter[])
              : []

        try {
          const fetched = await Promise.all(
            centersArray.map((c) =>
              fetchSportCenterByIdAction(c.centerId).catch(() => null)
            )
          )
          setSportCenters(
            fetched.filter((item): item is SportCenter => item !== null)
          )
        } catch (error) {
          console.error("Failed to fetch sport center details:", error)
        }
      }
      setIsLoading(false)
    })
  }, [tournament?.id])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              {t("public.overview.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="leading-relaxed text-gray-700">
                {tournament?.description || t("public.overview.description")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              {t("public.overview.detailsTitle", {
                defaultValue: "Venue & Schedule",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : (
              <div className="space-y-6">
                {sportCenters.length > 0 ? (
                  <div className="space-y-6">
                    {sportCenters.map((sc, idx) => (
                      <div
                        key={sc.id}
                        className={
                          idx > 0 ? "border-gray-150 border-t pt-5" : ""
                        }
                      >
                        <div>
                          <div className="mb-1 font-bold text-gray-900">
                            {t("public.venue.location")}
                          </div>
                          <p className="font-medium text-gray-800">{sc.name}</p>
                          <p className="mt-0.5 text-sm text-gray-600">
                            {sc.address}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className="mb-1 font-bold text-gray-900">
                      {t("public.venue.location")}
                    </div>
                    <p className="font-medium text-gray-800">
                      {tournament?.venue || "No venue assigned"}
                    </p>
                  </div>
                )}

                {/* Schedule and Registration Dates Block */}
                <div className="border-gray-150 border-t pt-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="mb-1 font-bold text-gray-900">
                        {t("public.overview.tournamentDates", {
                          defaultValue: "Tournament Schedule",
                        })}
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        {tournament?.startDate
                          ? getDateOnly(tournament.startDate)
                          : "-"}
                        {" - "}
                        {tournament?.endDate
                          ? getDateOnly(tournament.endDate)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <div className="mb-1 font-bold text-gray-900">
                        {t("public.overview.registrationDates", {
                          defaultValue: "Registration Window",
                        })}
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        {tournament?.registrationStartDate
                          ? getDateOnly(tournament.registrationStartDate)
                          : "-"}
                        {" - "}
                        {tournament?.registrationEndDate
                          ? getDateOnly(tournament.registrationEndDate)
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6 text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
            <div className="mb-1 text-3xl font-extrabold text-gray-900">
              {participantsCount}
            </div>
            <div className="text-sm font-semibold text-gray-500">
              {t("public.stats.participants")}
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6 text-center">
            <Calendar className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
            <div className="mb-1 text-3xl font-extrabold text-gray-900">
              {eventsCount}
            </div>
            <div className="text-sm font-semibold text-gray-500">
              {t("public.stats.events")}
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6 text-center">
            <Trophy className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
            <div className="mb-1 text-3xl font-extrabold text-gray-900">
              {totalPrizes.toLocaleString("vi-VN")} VND
            </div>
            <div className="text-sm font-semibold text-gray-500">
              {t("public.stats.totalPrizes", { defaultValue: "Total Prizes" })}
            </div>
          </CardContent>
        </Card>
      </div>

      {sponsors && sponsors.length > 0 && (
        <SponsorsSection sponsors={sponsors} />
      )}
    </div>
  )
}
