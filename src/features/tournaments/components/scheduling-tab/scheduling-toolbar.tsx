"use client"

import { AlertTriangle, CalendarDays, MapPin, RefreshCw } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useSchedulingStore } from "../../stores/use-scheduling-store"
import type { TournamentCenter } from "../../types/tournament-center"
import type { TournamentEvent } from "../../types/tournament-event"

interface SchedulingToolbarProps {
  dates: string[]
  selectedDate: string
  setSelectedDate: (date: string) => void
  formatDateValue: (dateStr: string) => string
  centers: TournamentCenter[]
  selectedCenterId: string
  setSelectedCenterId: (centerId: string) => void
  events: TournamentEvent[]
  selectedEventId: string
  setSelectedEventId: (eventId: string) => void
  onReload: () => void
  onAutoSchedule: () => void
  viewMode?: "normal" | "preview"
  onChangeViewMode?: (mode: "normal" | "preview") => void
  hasPreview?: boolean
}

export function SchedulingToolbar({
  dates,
  selectedDate,
  setSelectedDate,
  formatDateValue,
  centers,
  selectedCenterId,
  setSelectedCenterId,
  events,
  selectedEventId,
  setSelectedEventId,
  onReload,
  onAutoSchedule,
  viewMode = "normal",
  onChangeViewMode,
  hasPreview = false,
}: SchedulingToolbarProps) {
  const { t } = useTournamentTranslation()
  const previewWarnings = useSchedulingStore((s) => s.previewWarnings)
  const [isWarningsDialogOpen, setIsWarningsDialogOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Date Select */}
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-60 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dates.length > 0 ? (
                dates.map((dateVal) => (
                  <SelectItem key={dateVal} value={dateVal}>
                    {formatDateValue(dateVal)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  {t("scheduling.toolbar.dates.noDates", {
                    defaultValue: "No dates configured",
                  })}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Sport Center Select */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <Select
            value={selectedCenterId || undefined}
            onValueChange={setSelectedCenterId}
          >
            <SelectTrigger className="w-60 bg-white">
              <SelectValue
                placeholder={t("scheduling.toolbar.centers.placeholder", {
                  defaultValue: "Select Sport Center",
                })}
              />
            </SelectTrigger>
            <SelectContent>
              {centers.map((center) => (
                <SelectItem key={center.centerId} value={center.centerId}>
                  {center.name}
                </SelectItem>
              ))}
              {centers.length === 0 && (
                <SelectItem value="none" disabled>
                  {t("scheduling.toolbar.centers.noCenters", {
                    defaultValue: "No centers associated",
                  })}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Event Select */}
        <div className="flex items-center gap-2">
          {/* <span className="text-sm font-medium text-gray-600">
            {t("scheduling.toolbar.eventLabel", { defaultValue: "Event:" })}
          </span> */}
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-64 bg-white">
              <SelectValue
                placeholder={t("scheduling.toolbar.events.all", {
                  defaultValue: "All Events",
                })}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("scheduling.toolbar.events.all", {
                  defaultValue: "All Events",
                })}
              </SelectItem>
              {events.map((evt) => (
                <SelectItem key={evt.id} value={evt.id.toString()}>
                  {evt.name} ({evt.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mode Selector */}
        {hasPreview && (
          <div className="ml-4 flex items-center rounded-lg border border-gray-200 bg-gray-100 p-0.5">
            <button
              type="button"
              onClick={() => onChangeViewMode?.("normal")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "normal"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {t("scheduling.toolbar.modes.normal", { defaultValue: "Normal" })}
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode?.("preview")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "preview"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {t("scheduling.toolbar.modes.preview", {
                defaultValue: "Preview",
              })}
            </button>
          </div>
        )}

        {/* Warnings Section */}
        {hasPreview && previewWarnings && previewWarnings.length > 0 && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => setIsWarningsDialogOpen(true)}
                    className="ml-4 flex cursor-pointer items-center gap-1.5 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-800 shadow-xs hover:bg-yellow-100/80"
                  >
                    <AlertTriangle className="h-4 w-4 animate-bounce text-yellow-600" />
                    <span>
                      {t("scheduling.toolbar.warningsCount", {
                        count: previewWarnings.length,
                        defaultValue: `${previewWarnings.length} Warnings`,
                      })}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="w-80 rounded-lg border border-yellow-200 bg-white p-3 text-gray-900 shadow-lg"
                >
                  <div className="space-y-1.5 text-xs">
                    <div className="font-bold text-yellow-900">
                      {t("scheduling.toolbar.warningsTitle", {
                        defaultValue: "Auto-Scheduling Warnings:",
                      })}
                    </div>
                    <ul className="list-disc space-y-1 pl-4 text-gray-700">
                      {previewWarnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Dialog
              open={isWarningsDialogOpen}
              onOpenChange={setIsWarningsDialogOpen}
            >
              <DialogContent className="max-w-md bg-white p-6">
                <DialogHeader className="mb-4">
                  <DialogTitle className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    {t("scheduling.toolbar.warningsDialog.title", {
                      defaultValue: "Auto-Scheduling Warnings",
                    })}
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-60 space-y-2 overflow-y-auto rounded border bg-gray-50 p-4 text-xs text-gray-700">
                  <ul className="list-disc space-y-2 pl-4">
                    {previewWarnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-0 flex justify-end">
                  <Button
                    onClick={() => setIsWarningsDialogOpen(false)}
                    className="bg-emerald-600 font-medium text-white hover:bg-emerald-700"
                  >
                    {t("scheduling.toolbar.warningsDialog.close", {
                      defaultValue: "Close",
                    })}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Action Buttons */}
        <div className="ml-auto flex items-center gap-3">
          <Button
            className="bg-emerald-600 font-medium text-white shadow-sm hover:bg-emerald-700"
            onClick={onAutoSchedule}
          >
            {t("scheduling.toolbar.autoScheduleBtn", {
              defaultValue: "Auto Schedule",
            })}
          </Button>

          {/* <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            onClick={onReload}
            title={t("scheduling.toolbar.reloadBtn", {
              defaultValue: "Reload Schedule",
            })}
          >
            <RefreshCw className="h-4 w-4" />
          </Button> */}
        </div>
      </div>
    </div>
  )
}
