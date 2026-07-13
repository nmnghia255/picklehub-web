"use client"

import { Trophy } from "lucide-react"
import { useEffect } from "react"

import { Card } from "@/components/ui/card"
import { useEventStore } from "@/features/tournaments/stores/use-event-store"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

interface EventStandingTabProps {
  tournamentId: string
  eventId: string
}

export function EventStandingTab({
  tournamentId,
  eventId,
}: EventStandingTabProps) {
  const { t } = useTournamentTranslation()
  const { standing, isLoadingStanding, fetchStandings } = useEventStore()
  const standingRows = Array.isArray(standing?.data) ? standing.data : []

  useEffect(() => {
    fetchStandings(tournamentId, eventId)
  }, [tournamentId, eventId, fetchStandings])

  if (isLoadingStanding) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border bg-white shadow-sm dark:bg-zinc-950">
        <span className="animate-pulse text-sm text-gray-500">
          {t("eventDetail.standing.loading", {
            defaultValue: "Loading standings...",
          })}
        </span>
      </div>
    )
  }

  if (!standing || standingRows.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-white text-gray-400 shadow-sm dark:bg-zinc-950">
        <Trophy className="h-8 w-8 text-gray-300" />
        <span className="text-sm">
          {t("eventDetail.standing.noData", {
            defaultValue: "No standing data available yet.",
          })}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Champion Banner */}
      {standing.meta.championTeamName && (
        <div className="relative flex items-center gap-4 overflow-hidden rounded-xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50/30 p-6 shadow-sm dark:from-zinc-900 dark:to-zinc-800">
          <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-10">
            <Trophy className="h-32 w-32 text-amber-500" />
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
            👑
          </div>
          <div>
            <span className="block text-xs font-semibold tracking-wider text-amber-800 uppercase">
              {t("eventDetail.standing.championLabel", {
                defaultValue: "Event Champion",
              })}
            </span>
            <h3 className="mt-0.5 text-xl font-bold text-gray-900 dark:text-amber-400">
              {standing.meta.championTeamName}
            </h3>
          </div>
        </div>
      )}

      {/* Standings Table Card */}
      <Card className="overflow-hidden border-gray-200 py-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-zinc-400">
            <thead className="border-gray-150 border-b bg-gray-50 text-xs text-gray-700 uppercase dark:bg-zinc-800 dark:text-zinc-300">
              <tr>
                <th className="px-6 py-6">
                  {t("eventDetail.standing.rank", { defaultValue: "Rank" })}
                </th>
                <th className="px-6 py-6">
                  {t("eventDetail.standing.team", { defaultValue: "Team" })}
                </th>
                <th className="px-6 py-6 text-center">
                  {t("eventDetail.standing.seed", { defaultValue: "Seed" })}
                </th>
                <th className="px-6 py-6 text-center">
                  {t("eventDetail.standing.wins", { defaultValue: "Wins" })}
                </th>
                <th className="px-6 py-6 text-center">
                  {t("eventDetail.standing.losses", { defaultValue: "Losses" })}
                </th>
                <th className="px-6 py-6 text-right">
                  {t("eventDetail.standing.result", { defaultValue: "Result" })}
                </th>
              </tr>
            </thead>
            <tbody className="dark:divide-zinc-850 divide-y divide-gray-100 bg-white dark:bg-zinc-900">
              {standingRows.map((row) => {
                const isPodium = row.position <= 3
                const rankStyle =
                  row.position === 1
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : row.position === 2
                      ? "bg-gray-100 text-gray-800 border-gray-200"
                      : row.position === 3
                        ? "bg-orange-100 text-orange-800 border-orange-200"
                        : "bg-gray-50 text-gray-600 border-gray-100"

                return (
                  <tr key={row.teamId} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${rankStyle}`}
                      >
                        {row.position === 1
                          ? "🥇"
                          : row.position === 2
                            ? "🥈"
                            : row.position === 3
                              ? "🥉"
                              : row.position}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold whitespace-nowrap text-gray-900 dark:text-zinc-100">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {row.seed || "-"}
                    </td>
                    <td className="px-6 py-4 text-center font-medium whitespace-nowrap text-emerald-600">
                      {row.wins}
                    </td>
                    <td className="px-6 py-4 text-center font-medium whitespace-nowrap text-rose-600">
                      {row.losses}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${isPodium ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 ring-inset" : "bg-gray-50 text-gray-600"}`}
                      >
                        {row.result}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
