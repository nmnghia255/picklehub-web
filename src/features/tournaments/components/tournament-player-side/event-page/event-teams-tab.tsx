import { Users } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import type { Team } from "../../../types/player"

interface EventTeamsTabProps {
  teams: Team[]
  isSingles: boolean
}

export function EventTeamsTab({ teams, isSingles }: EventTeamsTabProps) {
  const { t } = useTournamentTranslation()

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Users className="h-5 w-5 text-emerald-600" />
          {t("public.tabs.participants")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teams.length > 0 ? (
          isSingles ? (
            // Singles View
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team, index) => {
                const playerId = team.player1.id ?? team.player1.userId
                const profileHref = playerId
                  ? `/profile/${playerId}`
                  : undefined

                const content = (
                  <div
                    className={cn(
                      "group flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-sm",
                      profileHref && "cursor-pointer hover:bg-emerald-50/20"
                    )}
                  >
                    <Avatar className="h-10 w-10 border border-emerald-100 transition-transform group-hover:scale-105">
                      <AvatarFallback className="bg-emerald-50 font-bold text-emerald-700">
                        {team.player1.avatar ||
                          team.player1.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold text-gray-900 transition-colors group-hover:text-emerald-600">
                        {team.player1.name}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-gray-500">
                        <span>{t("public.participantsList.rating")}</span>
                        <span className="font-bold text-emerald-600">
                          {team.player1.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                )

                return profileHref ? (
                  <Link
                    key={team.id || index}
                    href={profileHref}
                    className="block"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={team.id || index}>{content}</div>
                )
              })}
            </div>
          ) : (
            // Doubles View
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team, index) => (
                <Card
                  key={team.id || index}
                  className="overflow-hidden border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                      {t("public.team", { defaultValue: "Team" })} {index + 1}
                    </span>
                    {team.avgRating !== null && (
                      <Badge className="border border-emerald-100 bg-emerald-50 text-[10px] font-extrabold text-emerald-700">
                        {team.avgRating.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    {/* Player 1 */}
                    {(() => {
                      const p1Id = team.player1.id ?? team.player1.userId
                      const p1Href = p1Id ? `/profile/${p1Id}` : undefined
                      const p1Content = (
                        <div
                          className={cn(
                            "group flex items-center gap-3 rounded-md p-1.5 transition-colors",
                            p1Href && "cursor-pointer hover:bg-emerald-50/50"
                          )}
                        >
                          <Avatar className="h-8 w-8 border border-emerald-100 transition-transform group-hover:scale-105">
                            <AvatarFallback className="bg-emerald-50 text-xs font-bold text-emerald-700">
                              {team.player1.avatar ||
                                team.player1.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-emerald-600">
                              {team.player1.name}
                            </div>
                            <div className="text-[10px] font-semibold text-gray-500">
                              {t("public.participantsList.rating")}{" "}
                              <span className="font-bold text-emerald-600">
                                {team.player1.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                      return p1Href ? (
                        <Link href={p1Href} className="block">
                          {p1Content}
                        </Link>
                      ) : (
                        p1Content
                      )
                    })()}

                    {/* Divider */}
                    {team.player2 && (
                      <div className="my-1 border-t border-gray-50" />
                    )}

                    {/* Player 2 */}
                    {team.player2 &&
                      (() => {
                        const p2Id = team.player2.id ?? team.player2.userId
                        const p2Href = p2Id ? `/profile/${p2Id}` : undefined
                        const p2Content = (
                          <div
                            className={cn(
                              "group flex items-center gap-3 rounded-md p-1.5 transition-colors",
                              p2Href && "cursor-pointer hover:bg-emerald-50/50"
                            )}
                          >
                            <Avatar className="h-8 w-8 border border-emerald-100 transition-transform group-hover:scale-105">
                              <AvatarFallback className="bg-emerald-50 text-xs font-bold text-emerald-700">
                                {team.player2.avatar ||
                                  team.player2.name
                                    .substring(0, 2)
                                    .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-emerald-600">
                                {team.player2.name}
                              </div>
                              <div className="text-[10px] font-semibold text-gray-500">
                                {t("public.participantsList.rating")}{" "}
                                <span className="font-bold text-emerald-600">
                                  {team.player2.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                        return p2Href ? (
                          <Link href={p2Href} className="block">
                            {p2Content}
                          </Link>
                        ) : (
                          p2Content
                        )
                      })()}
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          <div className="py-8 text-center text-gray-500">
            {t("public.noParticipantsYet", {
              defaultValue: "No participants registered yet",
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
