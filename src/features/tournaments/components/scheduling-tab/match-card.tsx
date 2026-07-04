"use client"

import { Clock, MapPin, Trash2, UserCheck, UserX } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Match } from "../../types/match"

interface MatchCardProps {
  activeMatch: Match & { isPreview?: boolean; isOtherEvent?: boolean }
  isPreviewMode: boolean
  matchWidth: number
  onDragStart: (
    e: React.DragEvent,
    matchId: string | number,
    duration: number
  ) => void
  onUnschedule: (fixtureId: string) => void
  onUnassignReferee: (fixtureId: string) => void
  onAssignRefereeClick: (match: Match) => void
  formatTimeSlot: (timeStr: string | null | undefined) => string
}

function getTeamName(
  team: { name?: string } | string | null | undefined
): string {
  if (!team) return "TBD"
  if (typeof team === "object") return team.name || "TBD"
  return String(team)
}

export function MatchCard({
  activeMatch,
  isPreviewMode,
  matchWidth,
  onDragStart,
  onUnschedule,
  onUnassignReferee,
  onAssignRefereeClick,
  formatTimeSlot,
}: MatchCardProps) {
  const { t } = useTournamentTranslation()

  return (
    <div
      className="relative shrink-0 border-r border-dashed border-gray-200 px-0.5"
      style={{ width: matchWidth }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              draggable={
                !activeMatch.isOtherEvent &&
                isPreviewMode &&
                activeMatch.isPreview
              }
              onDragStart={(e) => {
                if (!activeMatch.isOtherEvent) {
                  onDragStart(e, activeMatch.id, activeMatch.duration || 45)
                }
              }}
              className={`absolute inset-y-1 left-0.5 border-2 p-2 shadow-sm transition-all ${
                activeMatch.isOtherEvent
                  ? "cursor-not-allowed border-gray-200 bg-gray-100/80 text-gray-500"
                  : "hover:shadow-md"
              } ${
                !activeMatch.isOtherEvent && activeMatch.isPreview
                  ? "cursor-grab border-dashed border-indigo-400 bg-indigo-50/90 text-indigo-950 hover:bg-indigo-100/90 active:cursor-grabbing"
                  : !activeMatch.isOtherEvent &&
                      activeMatch.status === "completed"
                    ? "cursor-pointer border-emerald-300 bg-emerald-50 text-emerald-950"
                    : !activeMatch.isOtherEvent &&
                        activeMatch.status === "in_progress"
                      ? "animate-pulse cursor-pointer border-yellow-300 bg-yellow-50 text-yellow-950"
                      : !activeMatch.isOtherEvent
                        ? "cursor-pointer border-blue-300 bg-blue-50 text-blue-950"
                        : ""
              }`}
              style={{ width: matchWidth - 4 }}
            >
              <div className="flex flex-col text-[11px] leading-tight font-bold">
                <div className="truncate">{getTeamName(activeMatch.team1)}</div>
                <div className="text-[9px] font-normal text-gray-400">vs</div>
                <div className="truncate">{getTeamName(activeMatch.team2)}</div>
              </div>
              {activeMatch.isOtherEvent && activeMatch.event && (
                <div className="mt-1 truncate text-[9px] font-normal text-gray-400 italic">
                  {activeMatch.event}
                </div>
              )}
              {!activeMatch.isOtherEvent && activeMatch.refereeName && (
                <div className="mt-1 flex justify-start">
                  <Badge className="h-4 max-w-full truncate bg-emerald-600 px-1 text-[9px] text-white">
                    {t("scheduling.match.referee", {
                      defaultValue: "Referee",
                    })}
                  </Badge>
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
                      {t("scheduling.match.previewAllocation", {
                        defaultValue: "Preview Allocation",
                      })}
                    </Badge>
                  )}
                  {activeMatch.isOtherEvent && (
                    <Badge className="bg-gray-500 px-1.5 py-0.5 text-[9px] text-white">
                      {t("scheduling.match.otherEvent", {
                        defaultValue: "Other Event",
                      })}
                    </Badge>
                  )}
                  <div className="flex flex-col text-sm leading-tight font-bold">
                    <div>{getTeamName(activeMatch.team1)}</div>
                    <div className="text-xs font-normal text-gray-400">vs</div>
                    <div>{getTeamName(activeMatch.team2)}</div>
                  </div>
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
                      time: formatTimeSlot(activeMatch.startTime),
                      defaultValue: `Start: ${formatTimeSlot(
                        activeMatch.startTime
                      )}`,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span>{activeMatch.court}</span>
                </div>
              </div>

              {activeMatch.isOtherEvent ? (
                <div className="border-t pt-2 text-[11px] font-medium text-gray-500 italic">
                  {t("scheduling.match.otherEventNote", {
                    event: activeMatch.event,
                    defaultValue: `This match belongs to another event (${activeMatch.event}). Switch events to manage it.`,
                  })}
                </div>
              ) : activeMatch.isPreview ? (
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
                          onUnassignReferee(activeMatch.id.toString())
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
                        onClick={() => onAssignRefereeClick(activeMatch)}
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
                      onClick={() => onUnschedule(activeMatch.id.toString())}
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
    </div>
  )
}
