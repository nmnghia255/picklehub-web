"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Team, TournamentSchedule } from "../../types/schedule"

interface LiveMatchesCardProps {
  liveMatches: TournamentSchedule[]
  isLoading: boolean
  tournamentId?: number
}

function getTeamName(team: Team | null | undefined): string {
  if (!team) return "TBD"
  return team.name
}

export function LiveMatchesCard({
  liveMatches,
  isLoading,
  tournamentId,
}: LiveMatchesCardProps) {
  const { t } = useTournamentTranslation()
  const router = useRouter()

  return (
    <Card className="gap-0 border-gray-200 pb-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-800">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
          {t("liveControl.liveMatches.titleWithCount", {
            count: liveMatches.length,
            defaultValue: `Active Live Matches (${liveMatches.length})`,
          })}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-72">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : liveMatches.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              {t("liveControl.liveMatches.noMatches", {
                defaultValue: "No live matches currently in progress",
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {liveMatches.map((match) => {
                const t1 = getTeamName(match.team1)
                const t2 = getTeamName(match.team2)
                return (
                  <div
                    key={match.id}
                    onClick={() => {
                      const targetMatchId = match.externalMatchId
                      router.push(
                        `/score?matchId=${targetMatchId}&tournamentId=${tournamentId || ""}&team1=${encodeURIComponent(
                          t1
                        )}&team2=${encodeURIComponent(t2)}&mode=view`
                      )
                    }}
                    className="cursor-pointer rounded-lg border border-yellow-200 bg-yellow-50/60 p-4 shadow-xs transition-colors hover:bg-yellow-100/60"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <Badge className="mb-2 bg-yellow-600 text-white">
                          {match.court ||
                            t("liveControl.matchQueue.noCourt", {
                              defaultValue: "No Court",
                            })}
                        </Badge>
                        <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                          {match.event} • {match.round}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-700">
                          {match.score || "0 - 0"}
                        </div>
                        {match.refereeName && (
                          <div className="text-[10px] font-medium text-gray-500">
                            {t("liveControl.liveMatches.refName", {
                              refName: match.refereeName,
                              defaultValue: `Ref: ${match.refereeName}`,
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      {t1}{" "}
                      <span className="px-1 text-gray-400">
                        {t("liveControl.liveMatches.vs", {
                          defaultValue: "vs",
                        })}
                      </span>{" "}
                      {t2}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
