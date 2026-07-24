"use client"

import { Check, Trophy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useCreateTournamentStore } from "../../stores/create-tournament-store"
import type { RewardType } from "../../types/prize"

interface PositionConfig {
  id: string
  name: string
}

interface PositionPrizeForm {
  cashValue: string
  hasTrophy: boolean
  description: string
}

function getPositionsForCapacity(capacity: number): PositionConfig[] {
  const positions: PositionConfig[] = []
  if (capacity >= 1) {
    positions.push({ id: "1st", name: "1st Place (Champion)" })
  }
  if (capacity >= 2) {
    positions.push({ id: "2nd", name: "2nd Place (Runner-up)" })
  }
  if (capacity >= 3) {
    positions.push({ id: "3rd", name: "3rd Place" })
  }
  if (capacity >= 4) {
    positions.push({ id: "4th", name: "4th Place" })
  }

  if (capacity > 4) {
    if (capacity <= 8) {
      positions.push({ id: "5th-rest", name: `5th-${capacity}th Place` })
    } else {
      positions.push({ id: "5th-8th", name: "5th-8th Place" })
    }
  }
  if (capacity > 8) {
    if (capacity <= 16) {
      positions.push({ id: "9th-rest", name: `9th-${capacity}th Place` })
    } else {
      positions.push({ id: "9th-16th", name: "9th-16th Place" })
    }
  }
  if (capacity > 16) {
    if (capacity <= 32) {
      positions.push({ id: "17th-rest", name: `17th-${capacity}th Place` })
    } else {
      positions.push({ id: "17-32nd", name: "17th-32nd Place" })
    }
  }
  if (capacity > 32) {
    if (capacity <= 64) {
      positions.push({ id: "33rd-rest", name: `33rd-${capacity}th Place` })
    } else {
      positions.push({ id: "33-64th", name: "33rd-64th Place" })
    }
  }
  return positions
}

interface EventCapacityProps {
  capacity: number
}

function EventCapacity({ capacity }: EventCapacityProps) {
  const { t } = useTournamentTranslation()
  return (
    <span>
      {t("create.step4.capacity", {
        capacity,
        defaultValue: `Capacity: ${capacity} Slots`,
      })}
    </span>
  )
}

interface EventDUPRProps {
  skillRange: string
}

function EventDUPR({ skillRange }: EventDUPRProps) {
  const { t } = useTournamentTranslation()
  return (
    <span>
      {t("create.step4.dupr", {
        skillRange,
        defaultValue: `DUPR: ${skillRange}`,
      })}
    </span>
  )
}

export function Step4Prizes() {
  const { t } = useTournamentTranslation()
  const events = useCreateTournamentStore((state) => state.events)
  const prizes = useCreateTournamentStore((state) => state.prizes)
  const setPrizes = useCreateTournamentStore((state) => state.setPrizes)

  const [activeEvent, setActiveEvent] = useState<(typeof events)[0] | null>(
    null
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<
    Record<string, PositionPrizeForm>
  >({})

  const getPositionName = (pos: PositionConfig, capacity: number) => {
    return t(`create.step4.positions.${pos.id}`, {
      capacity,
      defaultValue: pos.name,
    })
  }

  const handleEditEvent = (event: (typeof events)[0]) => {
    const eventPrizes = prizes.filter(
      (p) => String(p.eventId) === String(event.id)
    )
    const positions = getPositionsForCapacity(event.capacity)
    const initialForm: Record<string, PositionPrizeForm> = {}

    positions.forEach((pos) => {
      const posName = getPositionName(pos, event.capacity)
      // Find matching cash prize
      const cashPrize = eventPrizes.find(
        (p) =>
          p.rewardType === "cash" &&
          (String(p.id) === `${event.id}-${pos.id}-cash` ||
            String(p.id).endsWith(`-${pos.id}-cash`) ||
            p.name === `${pos.name} - Cash` ||
            p.name === `${posName} - Cash` ||
            p.name.toLowerCase().includes(pos.id) ||
            (pos.id === "1st" &&
              (p.name.toLowerCase().includes("winner") ||
                p.name.toLowerCase().includes("champion") ||
                p.name.toLowerCase().includes("vô địch"))) ||
            (pos.id === "2nd" &&
              (p.name.toLowerCase().includes("runner") ||
                p.name.toLowerCase().includes("á quân"))))
      )

      // Find matching trophy/medal prize
      const trophyPrize = eventPrizes.find(
        (p) =>
          p.rewardType === "physical" &&
          (String(p.id) === `${event.id}-${pos.id}-trophy` ||
            String(p.id).endsWith(`-${pos.id}-trophy`) ||
            p.name === `${pos.name} - Trophy` ||
            p.name === `${posName} - Trophy` ||
            (pos.id === "1st" &&
              (p.name.toLowerCase().includes("medal") ||
                p.name.toLowerCase().includes("trophy") ||
                p.name.toLowerCase().includes("cúp") ||
                p.name.toLowerCase().includes("huy chương"))))
      )

      initialForm[pos.id] = {
        cashValue: cashPrize ? cashPrize.value.toLocaleString("vi-VN") : "",
        hasTrophy: !!trophyPrize,
        description: cashPrize?.description || trophyPrize?.description || "",
      }
    })

    setFormValues(initialForm)
    setActiveEvent(event)
    setIsDialogOpen(true)
  }

  const handleCashChange = (posId: string, val: string) => {
    const rawValue = val.replace(/\D/g, "")
    const formatted = rawValue ? Number(rawValue).toLocaleString("vi-VN") : ""
    setFormValues((prev) => ({
      ...prev,
      [posId]: {
        ...(prev[posId] || {
          cashValue: "",
          hasTrophy: false,
          description: "",
        }),
        cashValue: formatted,
      },
    }))
  }

  const handleTrophyChange = (posId: string, checked: boolean) => {
    setFormValues((prev) => ({
      ...prev,
      [posId]: {
        ...(prev[posId] || {
          cashValue: "",
          hasTrophy: false,
          description: "",
        }),
        hasTrophy: checked,
      },
    }))
  }

  const handleDescriptionChange = (posId: string, val: string) => {
    setFormValues((prev) => ({
      ...prev,
      [posId]: {
        ...(prev[posId] || {
          cashValue: "",
          hasTrophy: false,
          description: "",
        }),
        description: val,
      },
    }))
  }

  const handleSave = () => {
    if (!activeEvent) return

    const positions = getPositionsForCapacity(activeEvent.capacity)
    const newEventPrizes: (typeof prizes)[0][] = []

    positions.forEach((pos) => {
      const config = formValues[pos.id]
      if (!config) return

      const numericCash = Number(config.cashValue.replace(/\D/g, "")) || 0
      const posName = getPositionName(pos, activeEvent.capacity)

      if (numericCash > 0) {
        newEventPrizes.push({
          id: `${activeEvent.id}-${pos.id}-cash`,
          name: `${posName} - Cash`,
          rewardType: "cash" as RewardType,
          value: numericCash,
          description: config.description || `${posName} Cash Prize`,
          eventId: activeEvent.id,
        })
      }

      if (config.hasTrophy) {
        newEventPrizes.push({
          id: `${activeEvent.id}-${pos.id}-trophy`,
          name: `${posName} - Trophy`,
          rewardType: "physical" as RewardType,
          value: 0,
          description: config.description || `${posName} Trophy`,
          eventId: activeEvent.id,
        })
      }
    })

    // Update global store: replace prizes for this event, preserve others
    const otherPrizes = prizes.filter(
      (p) => String(p.eventId) !== String(activeEvent.id)
    )
    setPrizes([...otherPrizes, ...newEventPrizes])
    setIsDialogOpen(false)
    setActiveEvent(null)
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <p className="text-sm text-gray-600">
          {t("create.step4.prizesDesc", {
            defaultValue:
              "Configure placement rewards (cash and trophies) for each event in your tournament. Click on any event card below to edit its prize list.",
          })}
        </p>
      </div>

      <div className="grid gap-4">
        {events.map((event) => {
          const eventPrizes = prizes.filter(
            (p) => String(p.eventId) === String(event.id)
          )
          const positions = getPositionsForCapacity(event.capacity)
          const isComplete = positions.every((pos) => {
            const posName = getPositionName(pos, event.capacity)
            return eventPrizes.some(
              (p) =>
                String(p.id) === `${event.id}-${pos.id}-cash` ||
                String(p.id) === `${event.id}-${pos.id}-trophy` ||
                String(p.id).endsWith(`-${pos.id}-cash`) ||
                String(p.id).endsWith(`-${pos.id}-trophy`) ||
                p.name.startsWith(pos.name) ||
                p.name.startsWith(posName)
            )
          })

          return (
            <Card
              key={event.id}
              onClick={() => handleEditEvent(event)}
              className="cursor-pointer border border-gray-200 transition-all hover:border-emerald-400 hover:shadow-md"
            >
              <CardContent className="flex items-center justify-between px-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {event.name}
                    </h4>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-sm font-medium text-emerald-700 capitalize">
                      {t(`events.dialog.types.${event.type.toLowerCase()}`, {
                        defaultValue: event.type,
                      })}
                    </span>
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-sm font-medium text-blue-700 capitalize">
                      {t(
                        `events.dialog.genders.${event.gender.toLowerCase()}`,
                        { defaultValue: event.gender }
                      )}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <EventCapacity capacity={event.capacity} />
                    <span className="text-gray-300">•</span>
                    <EventDUPR skillRange={event.skillRange} />
                  </div>
                </div>

                {/* Completeness Status on the right */}
                <div>
                  {isComplete ? (
                    <span className="inline-flex items-center gap-1.5 rounded bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                      <Check className="h-3 w-3" />
                      {t("create.step4.statusComplete", {
                        defaultValue: "Complete",
                      })}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                      {t("create.step4.statusUncompleted", {
                        defaultValue: "Uncompleted",
                      })}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {events.length === 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 py-6 text-center text-sm text-amber-600">
            {t("create.step4.noEvents", {
              defaultValue:
                "⚠️ Please add at least one Event in the previous step before configuring prizes.",
            })}
          </div>
        )}
      </div>

      {activeEvent && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto py-0 sm:max-w-175">
            <DialogHeader>
              <DialogTitle className="pt-4 text-xl font-bold">
                {t("create.step4.dialogTitle", {
                  eventName: activeEvent.name,
                  defaultValue: `Configure Prizes — ${activeEvent.name}`,
                })}
              </DialogTitle>
              <DialogDescription>
                {t("create.step4.dialogDesc", {
                  capacity: activeEvent.capacity,
                  defaultValue: `Define the rewards for placement positions based on the event capacity of ${activeEvent.capacity} slots.`,
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {getPositionsForCapacity(activeEvent.capacity).map((pos) => {
                const config = formValues[pos.id] || {
                  cashValue: "",
                  hasTrophy: false,
                  description: "",
                }

                return (
                  <div
                    key={pos.id}
                    className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-gray-900">
                        {getPositionName(pos, activeEvent.capacity)}
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Cash Prize input */}
                      <div>
                        <Label
                          htmlFor={`cash-${pos.id}`}
                          className="text-xs text-gray-500"
                        >
                          {t("create.step4.cashPrizeLabel", {
                            currency: "VND",
                            defaultValue: "Cash Prize (VND)",
                          })}
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id={`cash-${pos.id}`}
                            placeholder={t("create.step4.cashPrizePlaceholder")}
                            value={config.cashValue}
                            onChange={(e) =>
                              handleCashChange(pos.id, e.target.value)
                            }
                            className="bg-white pr-12 font-medium"
                          />
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-xs font-semibold text-gray-400">
                              VND
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Trophy Checkbox */}
                      <div className="flex flex-col justify-end">
                        <div className="flex h-10 items-center space-x-2 rounded-md border bg-white px-3 transition-all hover:bg-gray-50">
                          <Checkbox
                            id={`trophy-${pos.id}`}
                            checked={config.hasTrophy}
                            onCheckedChange={(checked) =>
                              handleTrophyChange(pos.id, !!checked)
                            }
                          />
                          <Label
                            htmlFor={`trophy-${pos.id}`}
                            className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-700 select-none"
                          >
                            <Trophy className="h-4 w-4 text-amber-500" />
                            {t("create.step4.includeTrophy", {
                              defaultValue: "Include Trophy / Medal",
                            })}
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Description (optional) */}
                    <div>
                      <Label
                        htmlFor={`desc-${pos.id}`}
                        className="text-xs text-gray-500"
                      >
                        {t("create.step4.descriptionOptional", {
                          defaultValue: "Description (Optional)",
                        })}
                      </Label>
                      <Input
                        id={`desc-${pos.id}`}
                        placeholder={t("create.step4.descPlaceholder", {
                          defaultValue: "e.g. Awarded on center court",
                        })}
                        value={config.description}
                        onChange={(e) =>
                          handleDescriptionChange(pos.id, e.target.value)
                        }
                        className="mt-1 bg-white text-sm"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <DialogFooter className="border-t py-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setActiveEvent(null)
                }}
              >
                {t("create.step4.cancel", { defaultValue: "Cancel" })}
              </Button>
              <Button
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {t("create.step4.savePrizes", { defaultValue: "Save Prizes" })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
