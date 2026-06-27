"use client"

import { Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { TournamentPrize } from "../../../types/prize"

interface EventPrizesCardProps {
  prizes: TournamentPrize[]
  eventId: string | number
}

export function EventPrizesCard({ prizes, eventId }: EventPrizesCardProps) {
  const { t } = useTournamentTranslation()

  // Filter prizes for this specific event
  const eventPrizes = prizes.filter(
    (p) => String(p.eventId) === String(eventId)
  )

  const getPlacementLabel = (name: string) => {
    const lowerName = name.toLowerCase()
    if (
      lowerName.includes("1st") ||
      lowerName.includes("winner") ||
      lowerName.includes("champion") ||
      lowerName.includes("first") ||
      /hạng 1(?!\d)/.test(lowerName) ||
      lowerName.includes("vô địch")
    ) {
      return "1st Place"
    }
    if (
      lowerName.includes("2nd") ||
      lowerName.includes("runner") ||
      lowerName.includes("second") ||
      /hạng 2(?!\d)/.test(lowerName)
    ) {
      return "2nd Place"
    }
    if (
      lowerName.includes("3rd") ||
      lowerName.includes("third") ||
      /hạng 3(?!\d)/.test(lowerName)
    ) {
      return "3rd Place"
    }

    // Match pattern like "Hạng 17-32" or "Hạng 4"
    const match = name.match(/hạng\s+\d+(?:-\d+)?/i)
    if (match) {
      return match[0].charAt(0).toUpperCase() + match[0].slice(1)
    }
    return "Placement Reward"
  }

  const placementsMap: Record<
    string,
    {
      label: string
      badgeColor: string
      prizes: TournamentPrize[]
    }
  > = {}

  eventPrizes.forEach((prize) => {
    const label = getPlacementLabel(prize.name)
    if (!placementsMap[label]) {
      const colors: Record<string, string> = {
        "1st Place": "bg-amber-100 border-amber-300 text-amber-800",
        "2nd Place": "bg-blue-100 border-blue-300 text-blue-800",
        "3rd Place": "bg-orange-100 border-orange-300 text-orange-900",
      }
      placementsMap[label] = {
        label,
        badgeColor:
          colors[label] || "bg-gray-100 border-gray-300 text-gray-850",
        prizes: [],
      }
    }
    placementsMap[label].prizes.push(prize)
  })

  const placementsList = Object.values(placementsMap).sort((a, b) => {
    const getOrderValue = (label: string) => {
      const order: Record<string, number> = {
        "1st Place": 1,
        "2nd Place": 2,
        "3rd Place": 3,
      }
      if (order[label] !== undefined) return order[label]
      const numMatch = label.match(/\d+/)
      if (numMatch) {
        return parseInt(numMatch[0], 10) + 3
      }
      return 999
    }
    return getOrderValue(a.label) - getOrderValue(b.label)
  })

  if (placementsList.length === 0) {
    return (
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Trophy className="h-5 w-5 text-emerald-600" />
            {t("eventDetail.placementsRewards", {
              defaultValue: "Placements & Rewards",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center text-sm text-gray-400">
            {t("eventDetail.noPrizes", {
              defaultValue:
                "No custom prizes are configured for this category yet.",
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Trophy className="h-5 w-5 text-emerald-600" />
          {t("eventDetail.placementsRewards", {
            defaultValue: "Placements & Rewards",
          })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {placementsList.map((placement) => (
            <Card
              key={placement.label}
              className="border-gray-150 overflow-hidden border pt-0 shadow-sm"
            >
              {/* Placement Header Banner */}
              <div className="border-gray-150 flex items-center justify-between border-b bg-emerald-200/20 px-5 py-3 pt-4">
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${placement.badgeColor} shrink-0 border px-3 py-1.5 text-xs font-bold`}
                  >
                    {placement.label === "1st Place"
                      ? t("eventDetail.firstPlace", {
                          defaultValue: "1st Place",
                        })
                      : placement.label === "2nd Place"
                        ? t("eventDetail.secondPlace", {
                            defaultValue: "2nd Place",
                          })
                        : placement.label === "3rd Place"
                          ? t("eventDetail.thirdPlace", {
                              defaultValue: "3rd Place",
                            })
                          : placement.label}
                  </Badge>
                  <span className="text-sm font-bold text-gray-700">
                    {placement.label === "1st Place"
                      ? t("eventDetail.championRewards", {
                          defaultValue: "Champion Rewards",
                        })
                      : placement.label === "2nd Place"
                        ? t("eventDetail.runnerUpRewards", {
                            defaultValue: "Runner-up Rewards",
                          })
                        : t("eventDetail.placementRewards", {
                            defaultValue: "Placement Rewards",
                          })}
                  </span>
                </div>
              </div>

              {/* List of Prizes for this Placement */}
              <div className="divide-y divide-gray-100">
                {placement.prizes.map((prize) => (
                  <div
                    key={prize.id}
                    className="flex flex-col gap-4 p-5 transition-colors hover:bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-bold text-gray-900">
                        {prize.name}
                      </h4>
                      {prize.description && (
                        <p className="mt-1 text-sm leading-relaxed text-gray-500">
                          {prize.description}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center justify-end">
                      {prize.rewardType === "cash" ? (
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2 text-right">
                          <span className="block text-base font-black text-emerald-700">
                            {prize.value.toLocaleString()} VND
                          </span>
                          <span className="mt-0.5 block text-[10px] font-extrabold tracking-wider text-emerald-600 uppercase">
                            {t("eventDetail.cashPrize", {
                              defaultValue: "Cash Prize",
                            })}
                          </span>
                        </div>
                      ) : prize.rewardType === "physical" ? (
                        <div className="border-yellow-150 rounded-lg border bg-yellow-50 px-4 py-2 text-right">
                          <span className="block text-base font-black text-yellow-800">
                            {t("eventDetail.trophyMedal", {
                              defaultValue: "Trophy / Medal",
                            })}
                          </span>
                          <span className="mt-0.5 block text-[10px] font-extrabold tracking-wider text-yellow-700 uppercase">
                            {t("eventDetail.physicalReward", {
                              defaultValue: "Physical Reward",
                            })}
                          </span>
                        </div>
                      ) : (
                        <div className="border-blue-150 rounded-lg border bg-blue-50 px-4 py-2 text-right">
                          <span className="block text-base font-black text-blue-700">
                            {prize.value
                              ? `${prize.value.toLocaleString()} VND`
                              : prize.name}
                          </span>
                          <span className="mt-0.5 block text-[10px] font-extrabold tracking-wider text-blue-600 uppercase">
                            {t(
                              `events.dialog.rewardTypes.${prize.rewardType}`,
                              { defaultValue: prize.rewardType }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
