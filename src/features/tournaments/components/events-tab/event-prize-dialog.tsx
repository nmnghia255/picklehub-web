"use client"

import { Loader2, Trophy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
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

import type {
  RewardType,
  TournamentPrize,
  TournamentPrizeRequest,
} from "../../types/prize"

export interface PositionConfig {
  id: string
  name: string
}

export function getPositionsForCapacity(capacity: number): PositionConfig[] {
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

interface PositionPrizeForm {
  cashValue: string
  hasTrophy: boolean
  description: string
}

interface EventPrizeDialogProps {
  eventName: string
  eventId: number
  capacity: number
  initialPrizes: TournamentPrize[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (prizes: Omit<TournamentPrizeRequest, "eventId">[]) => Promise<void>
}

export function EventPrizeDialog({
  eventName,
  eventId,
  capacity,
  initialPrizes,
  isOpen,
  onOpenChange,
  onSave,
}: EventPrizeDialogProps) {
  const { t } = useTournamentTranslation()
  const [submitting, setSubmitting] = useState(false)
  const getPositionName = (pos: PositionConfig, capacity: number) => {
    return t(`create.step4.positions.${pos.id}`, {
      capacity,
      defaultValue: pos.name,
    })
  }

  const [formValues, setFormValues] = useState<
    Record<string, PositionPrizeForm>
  >(() => {
    const positions = getPositionsForCapacity(capacity)
    const initialForm: Record<string, PositionPrizeForm> = {}

    positions.forEach((pos) => {
      const posName = getPositionName(pos, capacity)
      // Find matching cash prize
      const cashPrize = initialPrizes.find(
        (p) =>
          p.rewardType === "cash" &&
          (String(p.id) === `${eventId}-${pos.id}-cash` ||
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
      const trophyPrize = initialPrizes.find(
        (p) =>
          p.rewardType === "physical" &&
          (String(p.id) === `${eventId}-${pos.id}-trophy` ||
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

    return initialForm
  })

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

  const handleSaveClick = async () => {
    setSubmitting(true)
    try {
      const positions = getPositionsForCapacity(capacity)
      const prizesToSave: Omit<TournamentPrizeRequest, "eventId">[] = []

      positions.forEach((pos) => {
        const config = formValues[pos.id]
        if (!config) return

        const numericCash = Number(config.cashValue.replace(/\D/g, "")) || 0
        const posName = getPositionName(pos, capacity)

        if (numericCash > 0) {
          prizesToSave.push({
            name: `${posName}`,
            rewardType: "cash" as RewardType,
            value: numericCash,
            description: config.description || `${posName} Cash Prize`,
          })
        }

        if (config.hasTrophy) {
          prizesToSave.push({
            name: `${posName}`,
            rewardType: "physical" as RewardType,
            value: 0,
            description: config.description || `${posName} Trophy`,
          })
        }
      })

      await onSave(prizesToSave)
    } catch (error) {
      console.error("Failed to save event prizes:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t("create.step4.dialogTitle", {
              eventName,
              defaultValue: `Configure Prizes — ${eventName}`,
            })}
          </DialogTitle>
          <DialogDescription>
            {t("create.step4.dialogDesc", {
              capacity,
              defaultValue: `Define the rewards for placement positions based on the event capacity of ${capacity} slots.`,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {getPositionsForCapacity(capacity).map((pos) => {
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
                    {getPositionName(pos, capacity)}
                  </h5>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Cash Prize input */}
                  <div>
                    <Label
                      htmlFor={`cash-${pos.id}`}
                      className="text-xs font-medium text-gray-500"
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
                        disabled={submitting}
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
                        disabled={submitting}
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
                    className="text-xs font-medium text-gray-500"
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
                    disabled={submitting}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t("create.step4.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            onClick={handleSaveClick}
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("create.step4.savePrizes", { defaultValue: "Save Prizes" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
