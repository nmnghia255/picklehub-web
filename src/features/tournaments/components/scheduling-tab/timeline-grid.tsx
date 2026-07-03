"use client"

import { Clock, MapPin, Trash2, UserCheck, UserX, Zap } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { TournamentBooking } from "../../types/booking"
import type { Match } from "../../types/match"
import type { CourtInfo } from "../../types/tournament-court"

interface TimelineGridProps {
  courtsList: CourtInfo[]
  timeSlots: string[]
  scheduledMatches: Match[]
  previewMatches?: Match[]
  bookings: TournamentBooking[]
  isPreviewMode?: boolean
  onUnschedule: (fixtureId: string) => void
  onUnschedulePreview?: (matchId: string) => void
  onUnassignReferee: (fixtureId: string) => void
  onAssignRefereeClick: (match: Match) => void
  onEmptySlotClick?: (
    courtId: string,
    courtName: string,
    timeSlot: string
  ) => void
  onMovePreviewMatch?: (
    matchId: string,
    courtId: string,
    time: string,
    duration: number
  ) => void
}

function getTeamName(
  team: { name?: string } | string | null | undefined
): string {
  if (!team) return "TBD"
  if (typeof team === "object") return team.name || "TBD"
  return String(team)
}

export function TimelineGrid({
  courtsList,
  timeSlots,
  scheduledMatches,
  previewMatches = [],
  bookings,
  isPreviewMode = false,
  onUnschedule,
  onUnassignReferee,
  onAssignRefereeClick,
  onEmptySlotClick,
  onMovePreviewMatch,
}: TimelineGridProps) {
  const { t } = useTournamentTranslation()
  const [activeDragCell, setActiveDragCell] = useState<{
    courtId: string
    time: string
  } | null>(null)

  const handleDragStart = (
    e: React.DragEvent,
    matchId: string | number,
    duration: number
  ) => {
    e.dataTransfer.setData("text/plain", matchId.toString())
    e.dataTransfer.setData("match-duration", duration.toString())
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragEnter = (
    e: React.DragEvent,
    courtId: string,
    time: string
  ) => {
    e.preventDefault()
    setActiveDragCell({ courtId, time })
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setActiveDragCell(null)
  }

  const handleDrop = (e: React.DragEvent, courtId: string, time: string) => {
    e.preventDefault()
    setActiveDragCell(null)
    const matchId = e.dataTransfer.getData("text/plain")
    const durationMin = Number(e.dataTransfer.getData("match-duration") || "45")
    onMovePreviewMatch?.(matchId, courtId, time, durationMin)
  }

  // Time slot normalizer
  const formatTimeSlot = (timeStr: string | null | undefined): string => {
    if (!timeStr) return ""
    if (timeStr.includes("T")) {
      // If it contains timezone info (Z, + or -), parse with Date to convert to local time
      if (
        timeStr.includes("Z") ||
        timeStr.includes("+") ||
        (timeStr.includes("-") && timeStr.split("T")[1].includes("-"))
      ) {
        try {
          const d = new Date(timeStr)
          if (!isNaN(d.getTime())) {
            return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
          }
        } catch (e) {
          console.error("Error formatting ISO time slot:", e)
        }
      }

      // Fallback/standard: just split on T to get literal local time part
      const timePart = timeStr.split("T")[1]
      const parts = timePart.split(":")
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`
    }
    if (timeStr.includes(":")) {
      const parts = timeStr.split(":")
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`
    }
    return timeStr
  }

  if (courtsList.length === 0) {
    return (
      <div className="flex h-full w-full flex-1 flex-col bg-gray-50 p-6">
        <div className="flex h-full w-full flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
          <MapPin className="mx-auto mb-4 h-12 w-12 animate-pulse text-emerald-500" />
          <h3 className="mb-2 text-base font-semibold text-gray-900">
            {t("scheduling.grid.noCourts", {
              defaultValue:
                "No courts booked for this Sport Center on the selected date.",
            })}
          </h3>
          <p className="text-sm text-gray-400">
            {t("scheduling.grid.noCourtsSub", {
              defaultValue:
                "Please confirm your court bookings in the Booking tab first.",
            })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="min-h-0 w-full flex-1">
      <div className="p-6">
        <div className="inline-block min-w-full">
          {/* Time Header */}
          <div className="mb-2 flex border-b pb-2">
            <div className="w-32 shrink-0 text-sm font-semibold text-gray-700">
              {t("scheduling.grid.courtsLabel", { defaultValue: "Courts" })}
            </div>
            <div className="flex pl-2">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="w-24 shrink-0 text-center text-xs font-semibold text-gray-600"
                >
                  {time}
                </div>
              ))}
            </div>
          </div>

          {/* Court Rows */}
          <div className="space-y-4">
            {courtsList.map((courtObj) => (
              <div key={courtObj.courtId} className="flex min-h-24">
                {/* Court Label */}
                <div className="flex w-32 shrink-0 items-center">
                  <div className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-900 shadow-sm">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span className="truncate">{courtObj.courtName}</span>
                  </div>
                </div>

                {/* Time Slots */}
                <div className="flex flex-1 pl-2">
                  {timeSlots.map((time) => {
                    // Check if this time slot is covered by an active booking for this court
                    const isSlotBooked = bookings
                      .flatMap((b) => b.items || [])
                      .some((it) => {
                        if (it.courtId !== courtObj.courtId) return false
                        const startNorm = formatTimeSlot(it.startTime)
                        const endNorm = formatTimeSlot(it.endTime)
                        const currentIndex = timeSlots.indexOf(time)
                        const startIdx = timeSlots.indexOf(startNorm)
                        const endIdx = timeSlots.indexOf(endNorm)

                        if (startIdx === -1) return false
                        const endSlotIdx =
                          endIdx !== -1 ? endIdx : timeSlots.length
                        return (
                          currentIndex >= startIdx && currentIndex < endSlotIdx
                        )
                      })

                    // Find if there's a match scheduled on this court covering this time slot
                    const match = scheduledMatches.find((m) => {
                      if (m.courtId !== courtObj.courtId) return false
                      const startNorm = formatTimeSlot(m.startTime)
                      const currentIndex = timeSlots.indexOf(time)
                      const startIdx = timeSlots.indexOf(startNorm)

                      if (startIdx === -1 || currentIndex === -1) return false

                      const durationSlots = Math.max(
                        1,
                        Math.ceil((m.duration || 45) / 30)
                      )
                      return (
                        currentIndex >= startIdx &&
                        currentIndex < startIdx + durationSlots
                      )
                    })

                    // Find if there's a preview match allocated on this court covering this time slot
                    const previewMatch = !match
                      ? previewMatches.find((m) => {
                          if (m.courtId !== courtObj.courtId) return false
                          const startNorm = formatTimeSlot(m.startTime)
                          const currentIndex = timeSlots.indexOf(time)
                          const startIdx = timeSlots.indexOf(startNorm)

                          if (startIdx === -1 || currentIndex === -1)
                            return false

                          const durationSlots = Math.max(
                            1,
                            Math.ceil((m.duration || 45) / 30)
                          )
                          return (
                            currentIndex >= startIdx &&
                            currentIndex < startIdx + durationSlots
                          )
                        })
                      : undefined

                    const activeMatch = (match ||
                      (previewMatch
                        ? { ...previewMatch, isPreview: true }
                        : undefined)) as
                      | (Match & { isPreview?: boolean })
                      | undefined

                    const isFirstSlot =
                      activeMatch &&
                      formatTimeSlot(activeMatch.startTime) === time
                    const durationSlots = activeMatch
                      ? Math.max(
                          1,
                          Math.ceil((activeMatch.duration || 45) / 30)
                        )
                      : 1

                    // Count how many consecutive slots from the match start are booked
                    // so the card never bleeds into unbooked columns
                    const bookedItems = bookings.flatMap((b) => b.items || [])
                    const startSlotIdx = activeMatch
                      ? timeSlots.indexOf(formatTimeSlot(activeMatch.startTime))
                      : -1
                    let bookedSlots = durationSlots
                    if (activeMatch && startSlotIdx !== -1) {
                      bookedSlots = 0
                      for (
                        let s = startSlotIdx;
                        s < startSlotIdx + durationSlots &&
                        s < timeSlots.length;
                        s++
                      ) {
                        const slotTime = timeSlots[s]
                        const covered = bookedItems.some((it) => {
                          if (it.courtId !== courtObj.courtId) return false
                          const bStart = formatTimeSlot(it.startTime)
                          const bEnd = formatTimeSlot(it.endTime)
                          const bStartIdx = timeSlots.indexOf(bStart)
                          const bEndIdx = timeSlots.indexOf(bEnd)
                          const sIdx = timeSlots.indexOf(slotTime)
                          const bEndSlotIdx =
                            bEndIdx !== -1 ? bEndIdx : timeSlots.length
                          return sIdx >= bStartIdx && sIdx < bEndSlotIdx
                        })
                        if (covered) bookedSlots++
                        else break
                      }
                    }

                    const slotsCount = Math.max(
                      1,
                      Math.min(durationSlots, bookedSlots)
                    )
                    const matchWidth = slotsCount * 96

                    if (activeMatch && !isFirstSlot) {
                      // Render nothing here, the first slot spans this slot width
                      return null
                    }

                    return (
                      <div
                        key={time}
                        className="relative w-24 shrink-0 border-r border-dashed border-gray-200 px-0.5"
                      >
                        {isFirstSlot && activeMatch ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  draggable={
                                    isPreviewMode && activeMatch.isPreview
                                  }
                                  onDragStart={(e) =>
                                    handleDragStart(
                                      e,
                                      activeMatch.id,
                                      activeMatch.duration || 45
                                    )
                                  }
                                  className={`absolute inset-y-1 left-0.5 border-2 p-2 shadow-sm transition-all hover:shadow-md ${
                                    activeMatch.isPreview
                                      ? "cursor-grab border-dashed border-indigo-400 bg-indigo-50/90 text-indigo-950 hover:bg-indigo-100/90 active:cursor-grabbing"
                                      : activeMatch.status === "completed"
                                        ? "cursor-pointer border-emerald-300 bg-emerald-50 text-emerald-950"
                                        : activeMatch.status === "in_progress"
                                          ? "animate-pulse cursor-pointer border-yellow-300 bg-yellow-50 text-yellow-950"
                                          : "cursor-pointer border-blue-300 bg-blue-50 text-blue-950"
                                  }`}
                                  style={{ width: matchWidth - 4 }}
                                >
                                  <div className="truncate text-xs font-bold">
                                    {getTeamName(activeMatch.team1)} vs{" "}
                                    {getTeamName(activeMatch.team2)}
                                  </div>
                                  {slotsCount >= 3 && (
                                    <div className="truncate text-[10px] opacity-80">
                                      {activeMatch.event}
                                    </div>
                                  )}
                                  {slotsCount >= 2 && (
                                    <div className="mt-1 flex items-center justify-between">
                                      <Badge
                                        variant="outline"
                                        className={`h-4 px-1 text-[9px] ${activeMatch.isPreview ? "border-indigo-300 bg-indigo-100/70 text-indigo-800" : "bg-white/70"}`}
                                      >
                                        {activeMatch.isPreview
                                          ? t("scheduling.match.previewLabel", {
                                              defaultValue: "Preview",
                                            })
                                          : activeMatch.round}
                                      </Badge>
                                      {activeMatch.isPreview ? (
                                        <Zap className="h-3 w-3 animate-pulse text-indigo-600" />
                                      ) : activeMatch.refereeName ? (
                                        <Badge className="h-4 bg-emerald-600 px-1 text-[9px] text-white">
                                          {t("scheduling.match.refName", {
                                            refereeName:
                                              activeMatch.refereeName,
                                            defaultValue: `Ref: ${activeMatch.refereeName}`,
                                          })}
                                        </Badge>
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="w-80 rounded-lg border bg-white p-4 text-gray-900 shadow-xl"
                              >
                                <div className="space-y-3">
                                  <div>
                                    <div className="mb-1 flex items-center gap-1.5">
                                      {activeMatch.isPreview && (
                                        <Badge className="bg-indigo-600 px-1.5 py-0.5 text-[9px] text-white hover:bg-indigo-700">
                                          {t(
                                            "scheduling.match.previewAllocation",
                                            {
                                              defaultValue:
                                                "Preview Allocation",
                                            }
                                          )}
                                        </Badge>
                                      )}
                                      <h4 className="text-sm font-bold">
                                        {getTeamName(activeMatch.team1)} vs{" "}
                                        {getTeamName(activeMatch.team2)}
                                      </h4>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      {activeMatch.event} • {activeMatch.round}
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 border-t pt-2 text-xs">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                                      <span>
                                        {t("scheduling.match.start", {
                                          time: formatTimeSlot(
                                            activeMatch.startTime
                                          ),
                                          defaultValue: `Start: ${formatTimeSlot(activeMatch.startTime)}`,
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                      <span>{activeMatch.court}</span>
                                    </div>
                                  </div>

                                  {activeMatch.isPreview ? (
                                    <div className="border-t pt-2 text-[11px] font-medium text-indigo-600">
                                      {t("scheduling.match.previewNote", {
                                        defaultValue:
                                          'This is a preview assignment. Click "Confirm & Run Auto-Scheduling" in the banner to apply this configuration.',
                                      })}
                                    </div>
                                  ) : (
                                    <>
                                      {activeMatch.refereeName ? (
                                        <div className="flex items-center justify-between rounded bg-emerald-50 p-2 text-xs text-emerald-950">
                                          <span>
                                            {t("scheduling.match.refereeName", {
                                              name: activeMatch.refereeName,
                                              defaultValue: `Referee: ${activeMatch.refereeName}`,
                                            })}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-700"
                                            onClick={() =>
                                              onUnassignReferee(
                                                activeMatch.id.toString()
                                              )
                                            }
                                          >
                                            <UserX className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 text-xs"
                                            onClick={() =>
                                              onAssignRefereeClick(activeMatch)
                                            }
                                          >
                                            <UserCheck className="mr-1 h-3 w-3" />{" "}
                                            {t(
                                              "scheduling.match.assignReferee",
                                              {
                                                defaultValue: "Assign Referee",
                                              }
                                            )}
                                          </Button>
                                        </div>
                                      )}

                                      <div className="flex gap-2 border-t pt-2">
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          className="h-8 w-full text-xs"
                                          onClick={() =>
                                            onUnschedule(
                                              activeMatch.id.toString()
                                            )
                                          }
                                        >
                                          <Trash2 className="mr-1 h-3.5 w-3.5" />{" "}
                                          {t("scheduling.match.unschedule", {
                                            defaultValue: "Unschedule",
                                          })}
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : isSlotBooked ? (
                          <div
                            onDragOver={handleDragOver}
                            onDragEnter={(e) =>
                              handleDragEnter(e, courtObj.courtId, time)
                            }
                            onDragLeave={handleDragLeave}
                            onDrop={(e) =>
                              handleDrop(e, courtObj.courtId, time)
                            }
                            className={`h-full min-h-20 cursor-pointer rounded border border-dashed transition-all duration-200 ${
                              activeDragCell?.courtId === courtObj.courtId &&
                              activeDragCell?.time === time
                                ? "scale-102 border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400"
                                : "border-gray-200 bg-white/40 hover:border-emerald-400 hover:bg-emerald-50/40"
                            }`}
                            onClick={() =>
                              onEmptySlotClick?.(
                                courtObj.courtId,
                                courtObj.courtName,
                                time
                              )
                            }
                          />
                        ) : (
                          <div
                            className="h-full min-h-20 cursor-not-allowed rounded border border-gray-200/50 bg-gray-100/50"
                            title={t("scheduling.grid.unavailableSlot", {
                              defaultValue: "Slot not booked",
                            })}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
