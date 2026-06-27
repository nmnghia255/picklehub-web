"use client"

import { Loader2, Zap } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  executeAutoScheduleAction,
  previewAutoScheduleAction,
} from "../../actions/schedule-actions"
import type {
  AutoScheduleConfigDto,
  AutoSchedulePreviewResponse,
  PreviewAssignment,
} from "../../types/schedule"
import type { TournamentEvent } from "../../types/tournament-event"

interface AutoScheduleDialogFormProps {
  tournamentId: number
  events: TournamentEvent[]
  courtsList: string[]
  onClose: () => void
  onApplied: () => void
}

export function AutoScheduleDialogForm({
  tournamentId,
  events,
  courtsList,
  onClose,
  onApplied,
}: AutoScheduleDialogFormProps) {
  const { t } = useTournamentTranslation()
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const activeEventId =
    selectedEventId || (events.length > 0 ? events[0].id.toString() : "")
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("20:00")
  const [matchDuration, setMatchDuration] = useState("45")
  const [bufferDuration, setBufferDuration] = useState("15")
  const [restTime, setRestTime] = useState("30")
  const [optimization, setOptimization] = useState<
    "fastest" | "balanced" | "max_rest"
  >("fastest")
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [previewResult, setPreviewResult] =
    useState<AutoSchedulePreviewResponse | null>(null)

  const buildConfig = (): AutoScheduleConfigDto => ({
    startTime: startTime,
    endTime: endTime,
    matchDurationMinutes: Number(matchDuration),
    restDurationMinutes: Number(restTime),
    minBreakBetweenMatchesMinutes: Number(bufferDuration),
    courtIds: courtsList,
    optimizationCriteria: optimization,
  })

  const handlePreview = async () => {
    if (!activeEventId) {
      toast.error(
        t("scheduling.toasts.selectEvent", {
          defaultValue: "Please select an event",
        })
      )
      return
    }
    setIsPreviewing(true)
    setPreviewResult(null)
    try {
      const res = await previewAutoScheduleAction(
        tournamentId,
        activeEventId,
        buildConfig()
      )
      if (res.success && res.data) {
        setPreviewResult(res.data)
        toast.success(
          t("scheduling.toasts.previewSuccess", {
            defaultValue: "Preview generated successfully",
          })
        )
      } else {
        toast.error(
          res.error ||
            t("scheduling.toasts.previewFailed", {
              defaultValue: "Failed to generate preview",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("scheduling.toasts.previewFailed", {
          defaultValue: "Failed to generate preview",
        })
      )
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeEventId) {
      toast.error(
        t("scheduling.toasts.selectEvent", {
          defaultValue: "Please select an event",
        })
      )
      return
    }
    setIsSaving(true)
    try {
      const res = await executeAutoScheduleAction(
        tournamentId,
        activeEventId,
        buildConfig()
      )
      if (res.success) {
        toast.success(
          t("scheduling.toasts.executeSuccess", {
            defaultValue: "Schedule applied and notifications sent to players!",
          })
        )
        onApplied()
      } else {
        toast.error(
          res.error ||
            t("scheduling.toasts.executeFailed", {
              defaultValue: "Failed to execute auto-schedule",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("scheduling.toasts.executeFailed", {
          defaultValue: "Failed to execute auto-schedule",
        })
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        {/* Select Event */}
        <div>
          <Label htmlFor="auto-schedule-event">
            {t("scheduling.autoScheduleForm.selectEvent", {
              defaultValue: "Select Event Category",
            })}
          </Label>
          <Select value={activeEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger id="auto-schedule-event" className="mt-1.5 bg-white">
              <SelectValue
                placeholder={t(
                  "scheduling.autoScheduleForm.selectEventPlaceholder",
                  { defaultValue: "Select Event" }
                )}
              />
            </SelectTrigger>
            <SelectContent>
              {events.map((evt) => (
                <SelectItem key={evt.id} value={evt.id.toString()}>
                  {evt.name} ({evt.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start/End Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-time">
              {t("scheduling.autoScheduleForm.startTime", {
                defaultValue: "Daily Start Time",
              })}
            </Label>
            <Input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="end-time">
              {t("scheduling.autoScheduleForm.endTime", {
                defaultValue: "Daily End Time",
              })}
            </Label>
            <Input
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Match Duration & Buffer */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="match-duration">
              {t("scheduling.autoScheduleForm.matchDuration", {
                defaultValue: "Match Duration (Minutes)",
              })}
            </Label>
            <Input
              id="match-duration"
              type="number"
              value={matchDuration}
              onChange={(e) => setMatchDuration(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="break-duration">
              {t("scheduling.autoScheduleForm.breakDuration", {
                defaultValue: "Court Cleaning Break (Minutes)",
              })}
            </Label>
            <Input
              id="break-duration"
              type="number"
              value={bufferDuration}
              onChange={(e) => setBufferDuration(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Athlete Rest Time & Optimization */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rest-time">
              {t("scheduling.autoScheduleForm.restTime", {
                defaultValue:
                  "Minimum Rest Time Between Athlete Matches (Minutes)",
              })}
            </Label>
            <Input
              id="rest-time"
              type="number"
              value={restTime}
              onChange={(e) => setRestTime(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="optimize-for">
              {t("scheduling.autoScheduleForm.optimizeFor", {
                defaultValue: "Optimization Criteria",
              })}
            </Label>
            <Select
              value={optimization}
              onValueChange={(val: "fastest" | "balanced" | "max_rest") =>
                setOptimization(val)
              }
            >
              <SelectTrigger id="optimize-for" className="mt-1.5 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fastest">
                  {t("scheduling.autoScheduleForm.optimizeOptions.fastest", {
                    defaultValue: "Fastest Completion",
                  })}
                </SelectItem>
                <SelectItem value="balanced">
                  {t("scheduling.autoScheduleForm.optimizeOptions.balanced", {
                    defaultValue: "Balanced Court Usage",
                  })}
                </SelectItem>
                <SelectItem value="max_rest">
                  {t("scheduling.autoScheduleForm.optimizeOptions.rest", {
                    defaultValue: "Maximum Rest Time",
                  })}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {previewResult && (
        <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-2 border-b pb-2 text-sm font-bold text-emerald-950">
            <Zap className="h-4 w-4 text-emerald-600" />
            {t("scheduling.autoScheduleForm.previewTitle", {
              defaultValue: "Preview Result",
            })}
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs text-emerald-950">
            <div>
              <span className="block font-medium text-gray-500">
                {t("scheduling.autoScheduleForm.projectedCompletedAt", {
                  defaultValue: "Estimated Completion Time:",
                })}
              </span>
              <span className="text-sm font-bold">
                {previewResult.projectedCompletedAt
                  ? new Date(
                      previewResult.projectedCompletedAt
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </span>
            </div>
            <div>
              <span className="block font-medium text-gray-500">
                {t("scheduling.autoScheduleForm.scheduledMatchesCount", {
                  defaultValue: "Matches Scheduled Successfully:",
                })}
              </span>
              <span className="text-sm font-bold text-emerald-700">
                {previewResult.scheduledMatchesCount}
              </span>
            </div>
            <div>
              <span className="block font-medium text-gray-500">
                {t("scheduling.autoScheduleForm.courtsUsed", {
                  defaultValue: "Courts Used:",
                })}
              </span>
              <span className="text-sm font-bold">
                {t("scheduling.autoScheduleForm.courtsUsedCount", {
                  count: previewResult.courtsUsedCount,
                  defaultValue: `${previewResult.courtsUsedCount} courts`,
                })}
              </span>
            </div>
          </div>

          {previewResult.previewAssignments &&
            previewResult.previewAssignments.length > 0 && (
              <div className="mt-2 text-xs">
                <span className="mb-1 block font-medium text-gray-500">
                  {t("scheduling.autoScheduleForm.previewAssignments", {
                    defaultValue: "Suggested Allocation:",
                  })}
                </span>
                <div className="max-h-36 space-y-1 overflow-y-auto rounded border bg-white p-2 text-[11px]">
                  {previewResult.previewAssignments.map(
                    (a: PreviewAssignment, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between border-b pb-1 last:border-0 last:pb-0"
                      >
                        <span className="font-medium">
                          Match ID {a.matchId}
                        </span>
                        <span className="text-gray-600">{a.courtName}</span>
                        <span className="font-semibold text-emerald-700">
                          {new Date(a.scheduledStartTime).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSaving}
        >
          {t("scheduling.autoScheduleForm.cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handlePreview}
          disabled={isPreviewing || isSaving}
        >
          {isPreviewing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
              {t("scheduling.autoScheduleForm.calculating", {
                defaultValue: "Calculating...",
              })}
            </>
          ) : (
            t("scheduling.autoScheduleForm.previewBtn", {
              defaultValue: "Preview Result",
            })
          )}
        </Button>
        <Button
          type="submit"
          className="bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={isSaving || isPreviewing}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
              {t("scheduling.autoScheduleForm.applying", {
                defaultValue: "Applying...",
              })}
            </>
          ) : (
            t("scheduling.autoScheduleForm.applyBtn", {
              defaultValue: "Save & Apply Schedule",
            })
          )}
        </Button>
      </div>
    </form>
  )
}
