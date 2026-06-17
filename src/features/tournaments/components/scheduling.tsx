import {
  AlertTriangle,
  Clock,
  MapPin,
  Settings,
  Upload,
  Users,
  Zap,
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
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

import { courts, scheduledMatches, timeSlots } from "../mock-data/scheduling"
import type { Match } from "../types/match"

export function Scheduling() {
  const { t } = useTournamentTranslation()
  const [showAutoSchedule, setShowAutoSchedule] = useState(false)
  const [selectedDate, setSelectedDate] = useState("2026-06-15")
  const [selectedEvent, setSelectedEvent] = useState("all")

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Left Panel - Unscheduled Matches */}
      <div className="flex w-96 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            {t("scheduling.unscheduled.title")}
          </h2>
          <p className="text-sm text-gray-600">
            {t("scheduling.unscheduled.subtitle", {
              count: scheduledMatches.length,
            })}
          </p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {scheduledMatches.map((match) => (
              <Card
                key={match.id}
                className="cursor-grab border-l-4 transition-all hover:shadow-md"
                style={{
                  borderLeftColor:
                    match.priority === "high"
                      ? "#ef4444"
                      : match.priority === "medium"
                        ? "#f59e0b"
                        : "#6b7280",
                }}
              >
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <Badge variant="outline" className="text-xs">
                      {t("scheduling.unscheduled.matchLabel", { id: match.id })}
                    </Badge>
                    <Badge
                      className={
                        match.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : match.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                      }
                    >
                      {match.priority}
                    </Badge>
                  </div>

                  <div className="mb-1 text-sm font-medium text-gray-900">
                    {match.match}
                  </div>
                  <div className="mb-2 text-xs text-gray-600">
                    {match.event}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {match.round}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t("scheduling.unscheduled.min", {
                        duration: match.duration,
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-2 border-t border-gray-200 p-4">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setShowAutoSchedule(true)}
          >
            <Zap className="mr-2 h-4 w-4" />
            {t("scheduling.unscheduled.autoSchedule")}
          </Button>
          <Button variant="outline" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            {t("scheduling.unscheduled.optimizeSchedule")}
          </Button>
        </div>
      </div>

      {/* Main Timeline */}
      <div className="flex flex-1 flex-col bg-gray-50">
        {/* Top Header */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-4">
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026-06-15">
                  {t("scheduling.toolbar.dates.june15")}
                </SelectItem>
                <SelectItem value="2026-06-16">
                  {t("scheduling.toolbar.dates.june16")}
                </SelectItem>
                <SelectItem value="2026-06-17">
                  {t("scheduling.toolbar.dates.june17")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("scheduling.toolbar.events.all")}
                </SelectItem>
                <SelectItem value="mens-doubles-4.0">
                  {t("scheduling.toolbar.events.mensDoubles")}
                </SelectItem>
                <SelectItem value="womens-singles">
                  {t("scheduling.toolbar.events.womensSingles")}
                </SelectItem>
                <SelectItem value="mixed-doubles">
                  {t("scheduling.toolbar.events.mixedDoubles")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("scheduling.toolbar.status.all")}
                </SelectItem>
                <SelectItem value="scheduled">
                  {t("scheduling.toolbar.status.scheduled")}
                </SelectItem>
                <SelectItem value="in_progress">
                  {t("scheduling.toolbar.status.inProgress")}
                </SelectItem>
                <SelectItem value="completed">
                  {t("scheduling.toolbar.status.completed")}
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Upload className="mr-2 h-4 w-4" />
                {t("scheduling.toolbar.publish")}
              </Button>
            </div>
          </div>

          {/* Warnings Banner */}
          <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-600" />
            <div className="text-sm text-yellow-900">
              <span className="font-medium">
                {t("scheduling.warnings.detected", { count: 2 })}
              </span>{" "}
              {t("scheduling.warnings.details")}
            </div>
          </div>
        </div>

        {/* Timeline Grid */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="inline-block min-w-full">
              {/* Time Header */}
              <div className="mb-2 flex">
                <div className="w-32 flex-shrink-0" />
                <div className="flex">
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className="w-24 flex-shrink-0 text-center text-xs font-medium text-gray-600"
                    >
                      {time}
                    </div>
                  ))}
                </div>
              </div>

              {/* Court Rows */}
              <div className="space-y-2">
                {courts.map((court) => (
                  <CourtRow
                    key={court}
                    court={court}
                    timeSlots={timeSlots}
                    matches={scheduledMatches.filter((m) => m.court === court)}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Auto Schedule Modal */}
      <Dialog open={showAutoSchedule} onOpenChange={setShowAutoSchedule}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("scheduling.autoScheduleForm.title")}</DialogTitle>
            <DialogDescription>
              {t("scheduling.autoScheduleForm.description")}
            </DialogDescription>
          </DialogHeader>
          <AutoScheduleForm onClose={() => setShowAutoSchedule(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CourtRow({
  court,
  timeSlots,
  matches,
}: {
  court: string
  timeSlots: string[]
  matches: Match[]
}) {
  const getMatchAtTime = (time: string) => {
    return matches.find((m) => {
      const matchStartIndex = timeSlots.indexOf(m.startTime || "")
      const currentIndex = timeSlots.indexOf(time)
      const slotsNeeded = (m.duration || 30) / 30
      return (
        currentIndex >= matchStartIndex &&
        currentIndex < matchStartIndex + slotsNeeded
      )
    })
  }

  return (
    <div className="flex">
      {/* Court Label */}
      <div className="flex w-32 flex-shrink-0 items-center">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900">
          <MapPin className="h-4 w-4 text-gray-400" />
          {court}
        </div>
      </div>

      {/* Time Slots */}
      <div className="flex flex-1">
        {timeSlots.map((time) => {
          const match = getMatchAtTime(time)
          const isFirstSlot = match && time === match.startTime
          const matchWidth = match ? ((match.duration || 30) / 30) * 96 : 96

          if (match && !isFirstSlot) {
            return <div key={time} className="w-24 flex-shrink-0" />
          }

          return (
            <div key={time} className="relative w-24 flex-shrink-0">
              {isFirstSlot && match ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute inset-y-0 cursor-pointer rounded-lg border-2 p-2 transition-all hover:shadow-lg ${
                          match.status === "completed"
                            ? "border-emerald-200 bg-emerald-50"
                            : match.status === "in_progress"
                              ? "animate-pulse border-yellow-300 bg-yellow-50"
                              : match.warnings?.length
                                ? "border-red-300 bg-red-50"
                                : "border-blue-200 bg-blue-50"
                        }`}
                        style={{ width: matchWidth }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 truncate text-xs font-semibold text-gray-900">
                              {match.match}
                            </div>
                            <Badge
                              className={
                                match.status === "completed"
                                  ? "bg-emerald-600 text-xs text-white"
                                  : match.status === "in_progress"
                                    ? "bg-yellow-600 text-xs text-white"
                                    : "bg-blue-600 text-xs text-white"
                              }
                            >
                              {match.round}
                            </Badge>
                          </div>
                          {match.warnings?.length ? (
                            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" />
                          ) : null}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-2">
                        <div className="font-semibold">{match.match}</div>
                        <div className="text-xs text-gray-600">
                          {match.event}
                        </div>
                        <div className="text-xs">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {match.startTime} • {match.duration} min
                        </div>
                        {match.warnings?.map((warning, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded bg-red-50 p-2 text-xs text-red-900"
                          >
                            <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                            {warning.message}
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div className="h-20 cursor-pointer rounded border border-dashed border-gray-200 transition-colors hover:border-emerald-300 hover:bg-emerald-50" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AutoScheduleForm({ onClose }: { onClose: () => void }) {
  const { t } = useTournamentTranslation()
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        onClose()
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-time">
            {t("scheduling.autoScheduleForm.startTime")}
          </Label>
          <Input
            id="start-time"
            type="time"
            defaultValue="08:00"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="end-time">
            {t("scheduling.autoScheduleForm.endTime")}
          </Label>
          <Input
            id="end-time"
            type="time"
            defaultValue="18:00"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="match-duration">
            {t("scheduling.autoScheduleForm.matchDuration")}
          </Label>
          <Input
            id="match-duration"
            type="number"
            defaultValue="45"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="break-duration">
            {t("scheduling.autoScheduleForm.breakDuration")}
          </Label>
          <Input
            id="break-duration"
            type="number"
            defaultValue="15"
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="available-courts">
          {t("scheduling.autoScheduleForm.availableCourts")}
        </Label>
        <Select defaultValue="all">
          <SelectTrigger id="available-courts" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("scheduling.autoScheduleForm.courtsOptions.all")}
            </SelectItem>
            <SelectItem value="4">
              {t("scheduling.autoScheduleForm.courtsOptions.1to4")}
            </SelectItem>
            <SelectItem value="custom">
              {t("scheduling.autoScheduleForm.courtsOptions.custom")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="rest-time">
          {t("scheduling.autoScheduleForm.restTime")}
        </Label>
        <Input
          id="rest-time"
          type="number"
          defaultValue="30"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="optimize-for">
          {t("scheduling.autoScheduleForm.optimizeFor")}
        </Label>
        <Select defaultValue="fastest">
          <SelectTrigger id="optimize-for" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fastest">
              {t("scheduling.autoScheduleForm.optimizeOptions.fastest")}
            </SelectItem>
            <SelectItem value="balanced">
              {t("scheduling.autoScheduleForm.optimizeOptions.balanced")}
            </SelectItem>
            <SelectItem value="rest">
              {t("scheduling.autoScheduleForm.optimizeOptions.rest")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="text-sm text-blue-900">
            <div className="mb-1 font-medium">
              {t("scheduling.autoScheduleForm.previewTitle")}
            </div>
            <div>{t("scheduling.autoScheduleForm.previewDesc")}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("scheduling.autoScheduleForm.cancel")}
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
          {t("scheduling.autoScheduleForm.generate")}
        </Button>
      </div>
    </form>
  )
}
