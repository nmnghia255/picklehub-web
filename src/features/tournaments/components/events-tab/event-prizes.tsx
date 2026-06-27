"use client"

import { HelpCircle, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import type { TournamentPrize } from "../../types/prize"
import type { TournamentEvent } from "../../types/tournament-event"
import { getPositionsForCapacity } from "./event-prize-dialog"

export function matchPrizeToPosition(
  prizeName: string,
  posId: string,
  capacity: number
): boolean {
  const nameLower = prizeName.toLowerCase()
  const cleanName = nameLower.replace(/\s+/g, "")

  if (posId === "1st") {
    return (
      cleanName.includes("1st") ||
      cleanName.includes("hạng1") ||
      cleanName.includes("winner") ||
      cleanName.includes("champion") ||
      cleanName.includes("vôđịch") ||
      /\b1\b/.test(nameLower) ||
      /\bhạng\s*1\b/i.test(nameLower) ||
      /^[^\d]*1[^\d]*$/.test(nameLower.split("-")[0])
    )
  }
  if (posId === "2nd") {
    return (
      cleanName.includes("2nd") ||
      cleanName.includes("hạng2") ||
      cleanName.includes("runner") ||
      cleanName.includes("áquân") ||
      /\b2\b/.test(nameLower) ||
      /\bhạng\s*2\b/i.test(nameLower)
    )
  }
  if (posId === "3rd") {
    return (
      cleanName.includes("3rd") ||
      cleanName.includes("hạng3") ||
      /\b3\b/.test(nameLower) ||
      /\bhạng\s*3\b/i.test(nameLower)
    )
  }
  if (posId === "4th") {
    return (
      cleanName.includes("4th") ||
      cleanName.includes("hạng4") ||
      /\b4\b/.test(nameLower) ||
      /\bhạng\s*4\b/i.test(nameLower)
    )
  }

  if (posId === "5th-8th" || posId === "5th-rest") {
    const end = posId === "5th-8th" ? "8" : String(capacity)
    return (
      cleanName.includes("5-8") ||
      cleanName.includes("5th-8th") ||
      cleanName.includes("hạng5-8") ||
      cleanName.includes(`5-${end}`) ||
      cleanName.includes(`5th-${end}`) ||
      cleanName.includes(`hạng5-${end}`) ||
      cleanName.includes("5th-rest") ||
      cleanName.includes("hạng5-rest")
    )
  }

  if (posId === "9th-16th" || posId === "9th-rest") {
    const end = posId === "9th-16th" ? "16" : String(capacity)
    return (
      cleanName.includes("9-16") ||
      cleanName.includes("9th-16th") ||
      cleanName.includes("hạng9-16") ||
      cleanName.includes(`9-${end}`) ||
      cleanName.includes(`9th-${end}`) ||
      cleanName.includes(`hạng9-${end}`) ||
      cleanName.includes("9th-rest") ||
      cleanName.includes("hạng9-rest")
    )
  }

  if (posId === "17-32nd" || posId === "17th-rest") {
    const end = posId === "17-32nd" ? "32" : String(capacity)
    return (
      cleanName.includes("17-32") ||
      cleanName.includes("17th-32nd") ||
      cleanName.includes("hạng17-32") ||
      cleanName.includes(`17-${end}`) ||
      cleanName.includes(`17th-${end}`) ||
      cleanName.includes(`hạng17-${end}`) ||
      cleanName.includes("17th-rest") ||
      cleanName.includes("hạng17-rest")
    )
  }

  if (posId === "33-64th" || posId === "33rd-rest") {
    const end = posId === "33-64th" ? "64" : String(capacity)
    return (
      cleanName.includes("33-64") ||
      cleanName.includes("33rd-64th") ||
      cleanName.includes("hạng33-64") ||
      cleanName.includes(`33-${end}`) ||
      cleanName.includes(`33rd-${end}`) ||
      cleanName.includes(`hạng33-${end}`) ||
      cleanName.includes("33rd-rest") ||
      cleanName.includes("hạng33-rest")
    )
  }

  return false
}

interface EventPrizesProps {
  selectedEvent: TournamentEvent | null
  selectedEventPrizes: TournamentPrize[]
  canManageEvents: boolean
  onConfigurePrizesClick: () => void
}

export function EventPrizes({
  selectedEvent,
  selectedEventPrizes,
  canManageEvents,
  onConfigurePrizesClick,
}: EventPrizesProps) {
  const { t } = useTournamentTranslation()

  const getPositionName = (
    pos: { id: string; name: string },
    capacity: number
  ) => {
    return t(`create.step4.positions.${pos.id}`, {
      capacity,
      defaultValue: pos.name,
    })
  }

  return (
    <Card className="border border-emerald-100 bg-emerald-50/10">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Trophy className="h-5 w-5 animate-pulse text-amber-500" />
            {selectedEvent
              ? t("events.prizes.sectionTitle", {
                  eventName: selectedEvent.name,
                  defaultValue: `Placement Prizes — ${selectedEvent.name}`,
                })
              : t("events.prizes.defaultSectionTitle", {
                  defaultValue: "Tournament Placement Prizes",
                })}
          </CardTitle>
          <p className="mt-1 text-sm text-gray-500">
            {selectedEvent
              ? t("events.prizes.sectionSubtitle", {
                  defaultValue:
                    "Configure or view placement rewards for this category.",
                })
              : t("events.prizes.defaultSectionSubtitle", {
                  defaultValue:
                    "Select an event from the table to manage rewards.",
                })}
          </p>
        </div>
        {selectedEvent && canManageEvents && (
          <Button
            onClick={onConfigurePrizesClick}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {selectedEventPrizes.length > 0
              ? t("events.prizes.editButton", { defaultValue: "Edit Prizes" })
              : t("events.prizes.createButton", {
                  defaultValue: "Configure Prizes",
                })}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!selectedEvent ? (
          <div className="flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed border-gray-200 bg-white/50 py-12 text-center text-gray-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
              <HelpCircle className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                {t("events.prizes.instructionTitle", {
                  defaultValue: "No Event Selected",
                })}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                {t("events.prizes.instructionDesc", {
                  defaultValue:
                    "Select an event from the table above to configure or view its placement prizes.",
                })}
              </p>
            </div>
          </div>
        ) : selectedEventPrizes.length > 0 ? (
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getPositionsForCapacity(selectedEvent.capacity).map((pos) => {
              const posPrizes = selectedEventPrizes.filter((p) =>
                matchPrizeToPosition(p.name, pos.id, selectedEvent.capacity)
              )

              const cashPrize = posPrizes.find((p) => p.rewardType === "cash")
              const trophyPrize = posPrizes.find(
                (p) => p.rewardType === "physical"
              )

              if (!cashPrize && !trophyPrize) return null

              return (
                <Card
                  key={pos.id}
                  className="border-gray-100 bg-white shadow-sm"
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                      <Trophy className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-semibold text-gray-900">
                        {getPositionName(pos, selectedEvent.capacity)}
                      </h4>
                      <div className="mt-1 flex flex-col gap-1 text-sm">
                        {cashPrize && (
                          <span className="font-bold text-emerald-600">
                            {formatCurrencyVnd(cashPrize.value)}
                          </span>
                        )}
                        {trophyPrize && (
                          <span className="flex items-center gap-1 font-medium text-amber-700">
                            🏆{" "}
                            {t("events.prizes.trophyLabel", {
                              defaultValue: "Cup / Medal Included",
                            })}
                          </span>
                        )}
                        {(cashPrize?.description ||
                          trophyPrize?.description) && (
                          <span className="mt-1 block truncate text-xs text-gray-400 italic">
                            {cashPrize?.description || trophyPrize?.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed border-gray-200 bg-white/50 py-12 text-center text-gray-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <Trophy className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800">
                {t("events.prizes.noPrizesMsg", {
                  defaultValue: "⚠️ No prizes configured for this event yet.",
                })}
              </p>
              <p className="mx-auto mt-1 max-w-md text-sm text-gray-400">
                {t("events.prizes.noPrizesHint", {
                  defaultValue:
                    "Set up placement rewards like cash and trophies to show participants what they can win.",
                })}
              </p>
            </div>
            {canManageEvents && (
              <Button
                onClick={onConfigurePrizesClick}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {t("events.prizes.createButton", {
                  defaultValue: "Configure Prizes",
                })}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
