"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useCreateTournamentStore } from "../../stores/create-tournament-store"
import type { TournamentEvent } from "../../types/tournament-event"

function getPositionsForCapacity(capacity: number) {
  const positions = []
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

export function Step6Review() {
  const { t } = useTournamentTranslation()
  const formValues = useCreateTournamentStore((state) => state.formValues)
  const events = useCreateTournamentStore((state) => state.events)
  const prizes = useCreateTournamentStore((state) => state.prizes)

  const [expandedEvents, setExpandedEvents] = useState<
    Record<string | number, boolean>
  >({})

  const toggleExpand = (eventId: string | number) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }))
  }

  const getEventPrizes = (event: TournamentEvent) => {
    const eventPrizes = prizes.filter(
      (p) => String(p.eventId) === String(event.id)
    )
    const positions = getPositionsForCapacity(event.capacity)
    const processedPrizeIds = new Set<string>()
    const displayed: Array<{
      id: string
      name: string
      rewardType: string
      value: number
      hasTrophy: boolean
      description?: string
    }> = []

    positions.forEach((pos) => {
      const posName = t(`create.step4.positions.${pos.id}`, {
        capacity: event.capacity,
        defaultValue: pos.name,
      })

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
                p.name.toLowerCase().includes("vô dịch"))) ||
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

      if (cashPrize || trophyPrize) {
        if (cashPrize) processedPrizeIds.add(cashPrize.id)
        if (trophyPrize) processedPrizeIds.add(trophyPrize.id)

        displayed.push({
          id: cashPrize?.id || trophyPrize?.id || `${event.id}-${pos.id}`,
          name: posName,
          rewardType: cashPrize ? "cash" : "physical",
          value: cashPrize ? cashPrize.value : 0,
          hasTrophy: !!trophyPrize,
          description:
            cashPrize?.description || trophyPrize?.description || undefined,
        })
      }
    })

    // Add any remaining prizes for this event that were not grouped/matched
    eventPrizes.forEach((prize) => {
      if (!processedPrizeIds.has(prize.id)) {
        displayed.push({
          id: prize.id,
          name: prize.name,
          rewardType: prize.rewardType,
          value: prize.value || 0,
          hasTrophy: false,
          description: prize.description || undefined,
        })
        processedPrizeIds.add(prize.id)
      }
    })

    return displayed
  }

  return (
    <div className="space-y-6">
      {/* Basic Info Section (Blue Background) */}
      <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/80 p-6 shadow-xs">
        <h3 className="text-lg font-semibold text-gray-900">
          {t("create.step6.summaryTitle")}
        </h3>
        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div className="space-y-1">
            <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
              {t("create.step6.name")}
            </span>
            <p className="text-base font-medium text-gray-900">
              {formValues.name}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
              {t("create.step6.venue")}
            </span>
            <p className="text-base font-medium text-gray-900">
              {formValues.venue}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
              {t("create.step6.dates")}
            </span>
            <p className="text-base font-medium text-gray-900">
              {formValues.startDate} - {formValues.endDate}
            </p>
          </div>

          <div className="space-y-1 md:col-span-2">
            <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
              {t("create.step6.description", { defaultValue: "Description" })}
            </span>
            <p className="text-base font-medium whitespace-pre-wrap text-gray-900">
              {formValues.description || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Information Section (Indigo Background) */}
      <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/80 p-6 shadow-xs">
        <h3 className="text-lg font-semibold text-gray-900">
          {t("create.step5.paymentTitle", {
            defaultValue: "Payment Information",
          })}
        </h3>
        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div className="space-y-1">
            <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
              {t("create.step5.bankNameLabel", { defaultValue: "Bank Name" })}
            </span>
            <p className="text-base font-medium text-gray-900">
              {formValues.paymentBankName}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
              {t("create.step5.accountNameLabel", {
                defaultValue: "Account Holder Name",
              })}
            </span>
            <p className="text-base font-medium text-gray-900 uppercase">
              {formValues.paymentAccountName}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
              {t("create.step5.accountNumberLabel", {
                defaultValue: "Account Number",
              })}
            </span>
            <p className="font-mono text-base font-medium text-gray-900">
              {formValues.paymentAccountNumber}
            </p>
          </div>
          {formValues.paymentNote && (
            <div className="space-y-2">
              <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t("create.step5.noteLabel", {
                  defaultValue: "Instructions / Notes",
                })}
              </span>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                {formValues.paymentNote}
              </p>
            </div>
          )}
          {formValues.paymentQrUrl && (
            <div className="space-y-2 md:col-span-2">
              <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t("create.step5.qrUrlLabel", {
                  defaultValue: "QR Code Image",
                })}
              </span>
              <a
                href={formValues.paymentQrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block h-32 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-sm transition-all hover:ring-2 hover:ring-emerald-400"
              >
                <Image
                  src={formValues.paymentQrUrl}
                  alt="QR Code"
                  fill
                  sizes="128px"
                  className="object-contain"
                  unoptimized
                />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Competition Content / Events Section (Emerald Background) */}
      <div className="space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/80 p-6 shadow-xs">
        <h3 className="text-lg font-semibold text-gray-900">
          {t("create.steps.events", { defaultValue: "Competition Content" })}
        </h3>
        <div className="divide-y divide-gray-200/60">
          {events.map((event) => (
            <div key={event.id} className="py-4 first:pt-0 last:pb-0">
              {/* Event Header row (Clickable) */}
              <div
                onClick={() => toggleExpand(event.id)}
                className="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-emerald-100/40"
              >
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{event.name}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 capitalize">
                    <span>
                      {t(`events.dialog.types.${event.type.toLowerCase()}`, {
                        defaultValue: event.type,
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      {t(
                        `events.dialog.genders.${event.gender.toLowerCase()}`,
                        {
                          defaultValue: event.gender,
                        }
                      )}
                    </span>
                    <span>•</span>
                    <span>
                      {t("create.step6.dupr", {
                        skillRange: event.skillRange,
                        defaultValue: `DUPR: ${event.skillRange}`,
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="text-xs font-normal text-gray-500">
                        {t("events.dialog.entryFee")}:{" "}
                      </span>
                      <span className="font-semibold text-emerald-700">
                        {event.entryFee.toLocaleString("vi-VN")} VND
                      </span>
                    </p>
                    <p className="text-xs font-normal text-gray-500">
                      {t("create.step6.capacity", {
                        capacity: event.capacity,
                        defaultValue: `Cap: ${event.capacity}`,
                      })}
                    </p>
                  </div>
                  {expandedEvents[event.id] ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>

              {/* Event Prizes sub-panel */}
              {expandedEvents[event.id] && (
                <div className="mt-3 ml-2 space-y-3 rounded-r-lg border-l-2 border-emerald-300 bg-white/50 p-3 pl-4">
                  <h4 className="text-xs font-semibold tracking-wider text-emerald-800 uppercase">
                    {t("create.steps.prizes", {
                      defaultValue: "Prize Structure",
                    })}
                  </h4>
                  {getEventPrizes(event).map((prize) => (
                    <div
                      key={prize.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium text-gray-800">
                          {prize.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t("create.step6.prizeType", {
                            type:
                              prize.rewardType === "cash" && prize.hasTrophy
                                ? `${t("events.dialog.rewardTypes.cash", { defaultValue: "Cash" })} & ${t("events.dialog.rewardTypes.physical", { defaultValue: "Trophy" })}`
                                : t(
                                    `events.dialog.rewardTypes.${prize.rewardType}`,
                                    {
                                      defaultValue: prize.rewardType,
                                    }
                                  ),
                            defaultValue: `Type: ${prize.rewardType}`,
                          })}
                        </p>
                      </div>
                      <div className="text-right font-semibold text-emerald-700">
                        {prize.value > 0 ? (
                          <>
                            {prize.value.toLocaleString("vi-VN")} VND
                            {prize.hasTrophy &&
                              ` ${t("create.step6.trophySuffix", { defaultValue: "+ Trophy" })}`}
                          </>
                        ) : prize.hasTrophy ? (
                          t("events.dialog.rewardTypes.physical", {
                            defaultValue: "Trophy",
                          })
                        ) : (
                          t("create.step6.free", { defaultValue: "Free" })
                        )}
                      </div>
                    </div>
                  ))}
                  {getEventPrizes(event).length === 0 && (
                    <p className="text-xs text-gray-400 italic">
                      {t("create.step6.noPrizes", {
                        defaultValue: "No prizes configured for this event.",
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
          {events.length === 0 && (
            <p className="py-2 text-sm text-gray-500 italic">
              {t("create.step6.noEvents", {
                defaultValue: "No events configured.",
              })}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-normal text-emerald-900">
          {t("create.step6.reviewHint")}
        </p>
      </div>
    </div>
  )
}
