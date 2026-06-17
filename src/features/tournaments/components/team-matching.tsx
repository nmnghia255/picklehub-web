import { ArrowRight, Shuffle } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { generatedTeams, ungroupedPlayers } from "../mock-data/team-matching"

export function TeamMatching() {
  const { t } = useTournamentTranslation()
  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-semibold text-gray-900">
                {t("teamMatching.title")}
              </h1>
              <p className="text-gray-600">{t("teamMatching.subtitle")}</p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Shuffle className="mr-2 h-4 w-4" />
              {t("teamMatching.autoMatch")}
            </Button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Ungrouped Players */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("teamMatching.ungroupedPlayers", {
                  count: ungroupedPlayers.length,
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ungroupedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex cursor-grab items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <Avatar>
                      <AvatarFallback className="bg-gray-200 text-gray-700">
                        {player.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {player.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {player.gender === "M"
                          ? t("teamMatching.genderMale")
                          : t("teamMatching.genderFemale")}{" "}
                        • {t("teamMatching.age", { age: player.age })}
                      </div>
                    </div>
                    <Badge variant="outline" className="font-semibold">
                      {player.rating}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generated Teams */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("teamMatching.generatedTeams", {
                  count: generatedTeams.length,
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedTeams.map((team) => (
                  <div
                    key={team.id}
                    className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <Badge className="bg-emerald-600 text-white">
                        {t("teamMatching.matchScore", {
                          score: team.matchScore,
                        })}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {t("teamMatching.avgRating", {
                          rating: team.avgRating,
                        })}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">
                            {team.player1.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {team.player1.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {t("teamMatching.playerRating", {
                              rating: team.player1.rating,
                            })}
                          </div>
                        </div>
                      </div>

                      {team.player2 && (
                        <>
                          <div className="flex justify-center">
                            <div className="h-px w-8 bg-gray-300" />
                          </div>

                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {team.player2.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {team.player2.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {t("teamMatching.playerRating", {
                                  rating: team.player2.rating,
                                })}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <ArrowRight className="h-5 w-5 text-emerald-600" />
              <span>{t("teamMatching.instructions")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
