"use client"

import { Clock, MapPin, Trash2, UserCheck, UserX } from "lucide-react"

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

import type { Match } from "../../types/match"

interface TimelineGridProps {
  courtsList: string[]
  timeSlots: string[]
  scheduledMatches: Match[]
  onUnschedule: (fixtureId: string) => void
  onUnassignReferee: (fixtureId: string) => void
  onAssignRefereeClick: (match: Match) => void
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
  onUnschedule,
  onUnassignReferee,
  onAssignRefereeClick,
}: TimelineGridProps) {
  const { t } = useTournamentTranslation()

  // Time slot normalizer
  const formatTimeSlot = (timeStr: string | null | undefined): string => {
    if (!timeStr) return ""
    if (timeStr.includes("T")) {
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
            {courtsList.map((court) => (
              <div key={court} className="flex min-h-24">
                {/* Court Label */}
                <div className="flex w-32 shrink-0 items-center">
                  <div className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-900 shadow-sm">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span className="truncate">{court}</span>
                  </div>
                </div>

                {/* Time Slots */}
                <div className="flex flex-1 pl-2">
                  {timeSlots.map((time) => {
                    // Find if there's a match scheduled on this court covering this time slot
                    const match = scheduledMatches.find((m) => {
                      if (m.court !== court) return false
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

                    const isFirstSlot =
                      match && formatTimeSlot(match.startTime) === time
                    const slotsCount = match
                      ? Math.max(1, Math.ceil((match.duration || 45) / 30))
                      : 1
                    const matchWidth = slotsCount * 96

                    if (match && !isFirstSlot) {
                      // Render nothing here, the first slot spans this slot width
                      return null
                    }

                    return (
                      <div
                        key={time}
                        className="relative w-24 shrink-0 border-r border-dashed border-gray-200 px-0.5"
                      >
                        {isFirstSlot && match ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`absolute inset-y-1 left-0.5 cursor-pointer rounded-lg border-2 p-2 shadow-sm transition-all hover:shadow-md ${
                                    match.status === "completed"
                                      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                                      : match.status === "in_progress"
                                        ? "animate-pulse border-yellow-300 bg-yellow-50 text-yellow-950"
                                        : "border-blue-300 bg-blue-50 text-blue-950"
                                  }`}
                                  style={{ width: matchWidth - 4 }}
                                >
                                  <div className="truncate text-xs font-bold">
                                    {getTeamName(match.team1)} vs{" "}
                                    {getTeamName(match.team2)}
                                  </div>
                                  <div className="truncate text-[10px] opacity-80">
                                    {match.event}
                                  </div>
                                  <div className="mt-1 flex items-center justify-between">
                                    <Badge
                                      variant="outline"
                                      className="h-4 bg-white/70 px-1 text-[9px]"
                                    >
                                      {match.round}
                                    </Badge>
                                    {match.refereeName && (
                                      <Badge className="h-4 bg-emerald-600 px-1 text-[9px] text-white">
                                        {t("scheduling.match.refName", {
                                          refereeName: match.refereeName,
                                          defaultValue: `Ref: ${match.refereeName}`,
                                        })}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="w-80 rounded-lg border bg-white p-4 text-gray-900 shadow-xl"
                              >
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="text-sm font-bold">
                                      {getTeamName(match.team1)} vs{" "}
                                      {getTeamName(match.team2)}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      {match.event} • {match.round}
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 border-t pt-2 text-xs">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                                      <span>
                                        {t("scheduling.match.start", {
                                          time: formatTimeSlot(match.startTime),
                                          defaultValue: `Start: ${formatTimeSlot(match.startTime)}`,
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                      <span>{match.court}</span>
                                    </div>
                                  </div>

                                  {match.refereeName ? (
                                    <div className="flex items-center justify-between rounded bg-emerald-50 p-2 text-xs text-emerald-950">
                                      <span>
                                        {t("scheduling.match.refereeName", {
                                          name: match.refereeName,
                                          defaultValue: `Referee: ${match.refereeName}`,
                                        })}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-700"
                                        onClick={() =>
                                          onUnassignReferee(match.id.toString())
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
                                          onAssignRefereeClick(match)
                                        }
                                      >
                                        <UserCheck className="mr-1 h-3 w-3" />{" "}
                                        {t("scheduling.match.assignReferee", {
                                          defaultValue: "Assign Referee",
                                        })}
                                      </Button>
                                    </div>
                                  )}

                                  <div className="flex gap-2 border-t pt-2">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="h-8 w-full text-xs"
                                      onClick={() =>
                                        onUnschedule(match.id.toString())
                                      }
                                    >
                                      <Trash2 className="mr-1 h-3.5 w-3.5" />{" "}
                                      {t("scheduling.match.unschedule", {
                                        defaultValue: "Unschedule",
                                      })}
                                    </Button>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <div className="h-full min-h-20 rounded border border-dashed border-gray-200 bg-white/40 transition-colors hover:border-emerald-400 hover:bg-emerald-50/40" />
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
