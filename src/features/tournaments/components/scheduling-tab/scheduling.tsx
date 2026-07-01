"use client"

import { CalendarDays } from "lucide-react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  useCourtsList,
  useScheduledMatches,
  useSchedulingStore,
  useUnscheduledMatches,
} from "../../stores/use-scheduling-store"
import type { Tournament } from "../../types/tournament"
import type { TournamentEvent } from "../../types/tournament-event"
import { AutoScheduleDialogForm } from "./auto-schedule-dialog-form"
import { ManualScheduleForm } from "./manual-schedule-form"
import { RefereeAssignmentForm } from "./referee-assignment-form"
import { TimelineGrid } from "./timeline-grid"
import { UnscheduledMatchesPanel } from "./unscheduled-matches-panel"

// Default time slots to display in grid (normalized to HH:MM format)
const defaultTimeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
]

// Helper function to generate all dates between startDate and endDate (inclusive)
const getDatesRange = (startStr: string, endStr: string): string[] => {
  const dates: string[] = []
  if (!startStr || !endStr) return dates
  const start = new Date(startStr)
  const end = new Date(endStr)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return dates
  }

  const current = new Date(start)
  current.setHours(0, 0, 0, 0)
  const target = new Date(end)
  target.setHours(0, 0, 0, 0)

  while (current <= target) {
    const yyyy = current.getFullYear()
    const mm = String(current.getMonth() + 1).padStart(2, "0")
    const dd = String(current.getDate()).padStart(2, "0")
    dates.push(`${yyyy}-${mm}-${dd}`)
    current.setDate(current.getDate() + 1)
  }
  return dates
}

interface SchedulingProps {
  tournamentId: number
  events: TournamentEvent[]
  tournament: Tournament
}

function getTeamName(
  team: { name?: string } | string | null | undefined
): string {
  if (!team) return "TBD"
  if (typeof team === "object") return team.name || "TBD"
  return String(team)
}

export function Scheduling({
  tournamentId,
  events,
  tournament,
}: SchedulingProps) {
  const { t, i18n } = useTournamentTranslation()

  // Generate dates range from tournament
  const dates = getDatesRange(tournament.startDate, tournament.endDate)

  // Zustand Store states
  const setTournamentId = useSchedulingStore((s) => s.setTournamentId)
  const isLoading = useSchedulingStore((s) => s.isLoading)
  const selectedDate = useSchedulingStore((s) => s.selectedDate)
  const setSelectedDate = useSchedulingStore((s) => s.setSelectedDate)
  const selectedEventId = useSchedulingStore((s) => s.selectedEventId)
  const setSelectedEventId = useSchedulingStore((s) => s.setSelectedEventId)

  const showAutoSchedule = useSchedulingStore((s) => s.showAutoSchedule)
  const setShowAutoSchedule = useSchedulingStore((s) => s.setShowAutoSchedule)
  const showAssignReferee = useSchedulingStore((s) => s.showAssignReferee)
  const setShowAssignReferee = useSchedulingStore((s) => s.setShowAssignReferee)
  const setSelectedMatchForReferee = useSchedulingStore(
    (s) => s.setSelectedMatchForReferee
  )
  const showManualSchedule = useSchedulingStore((s) => s.showManualSchedule)
  const setShowManualSchedule = useSchedulingStore(
    (s) => s.setShowManualSchedule
  )
  const selectedMatchForManual = useSchedulingStore(
    (s) => s.selectedMatchForManual
  )
  const setSelectedMatchForManual = useSchedulingStore(
    (s) => s.setSelectedMatchForManual
  )

  // Store Actions
  const loadSchedule = useSchedulingStore((s) => s.loadSchedule)
  const unscheduleMatch = useSchedulingStore((s) => s.unscheduleMatch)
  const assignReferee = useSchedulingStore((s) => s.assignReferee)
  const unassignReferee = useSchedulingStore((s) => s.unassignReferee)
  const manualSchedule = useSchedulingStore((s) => s.manualSchedule)
  const reset = useSchedulingStore((s) => s.reset)

  // Computed selector hooks
  const unscheduledMatches = useUnscheduledMatches()
  const scheduledMatches = useScheduledMatches()
  const courtsList = useCourtsList()

  // Keep a ref of selectedDate so we can read the current value inside the
  // effect without making selectedDate a dependency (which would cause an
  // infinite loop because the effect itself calls setSelectedDate).
  const selectedDateRef = useRef(selectedDate)
  useEffect(() => {
    selectedDateRef.current = selectedDate
  }, [selectedDate])

  // Initialize store configuration and trigger load
  useEffect(() => {
    setTournamentId(tournamentId)
    const computedDates = getDatesRange(
      tournament.startDate,
      tournament.endDate
    )
    if (
      computedDates.length > 0 &&
      !computedDates.includes(selectedDateRef.current)
    ) {
      setSelectedDate(computedDates[0])
    }
    loadSchedule()

    return () => {
      reset()
    }
  }, [
    tournamentId,
    tournament.startDate,
    tournament.endDate,
    setTournamentId,
    setSelectedDate,
    loadSchedule,
    reset,
  ])

  const handleUnschedule = async (fixtureId: string) => {
    const res = await unscheduleMatch(fixtureId)
    if (res.success) {
      toast.success(
        t("scheduling.toasts.unscheduleSuccess", {
          defaultValue: "Match unscheduled successfully",
        })
      )
    } else {
      toast.error(
        res.error ||
          t("scheduling.toasts.unscheduleFailed", {
            defaultValue: "Failed to unschedule match",
          })
      )
    }
  }

  const handleAssignRefereeSubmit = async (
    refereeId: string,
    refereeName: string
  ) => {
    const res = await assignReferee(refereeId, refereeName)
    if (res.success) {
      toast.success(
        t("scheduling.toasts.assignRefereeSuccess", {
          defaultValue: "Referee assigned successfully",
        })
      )
    } else {
      toast.error(
        res.error ||
          t("scheduling.toasts.assignRefereeFailed", {
            defaultValue: "Failed to assign referee",
          })
      )
    }
  }

  const handleUnassignReferee = async (fixtureId: string) => {
    const res = await unassignReferee(fixtureId)
    if (res.success) {
      toast.success(
        t("scheduling.toasts.unassignRefereeSuccess", {
          defaultValue: "Referee unassigned successfully",
        })
      )
    } else {
      toast.error(
        res.error ||
          t("scheduling.toasts.unassignRefereeFailed", {
            defaultValue: "Failed to unassign referee",
          })
      )
    }
  }

  const handleManualScheduleSubmit = async (
    courtName: string,
    timeSlot: string
  ) => {
    const res = await manualSchedule(courtName, timeSlot)
    if (res.success) {
      toast.success(
        t("scheduling.toasts.scheduleSuccess", {
          defaultValue: "Match scheduled successfully",
        })
      )
    } else {
      toast.error(
        res.error ||
          t("scheduling.toasts.scheduleFailed", {
            defaultValue: "Failed to schedule match",
          })
      )
    }
  }

  const formatDateValue = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const locale = i18n.language === "vi" ? "vi-VN" : "en-US"
      return date.toLocaleDateString(locale, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden border-t border-gray-200">
      {/* Left Panel - Unscheduled Matches */}
      <UnscheduledMatchesPanel
        unscheduledMatches={unscheduledMatches}
        isLoading={isLoading}
        onMatchClick={(match) => {
          setSelectedMatchForManual(match)
          setShowManualSchedule(true)
        }}
        onAutoScheduleClick={() => setShowAutoSchedule(true)}
      />

      {/* Main Timeline */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-50">
        {/* Top Header */}
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

            {/* Event Select */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                {t("scheduling.toolbar.eventLabel", { defaultValue: "Event:" })}
              </span>
              <Select
                value={selectedEventId}
                onValueChange={setSelectedEventId}
              >
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

            <Button
              variant="outline"
              className="ml-auto border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              onClick={loadSchedule}
            >
              {t("scheduling.toolbar.reloadBtn", {
                defaultValue: "Reload Schedule",
              })}
            </Button>
          </div>
        </div>

        {/* Timeline Grid */}
        <TimelineGrid
          courtsList={courtsList}
          timeSlots={defaultTimeSlots}
          scheduledMatches={scheduledMatches.filter((m) =>
            m.startTime ? m.startTime.startsWith(selectedDate) : false
          )}
          onUnschedule={handleUnschedule}
          onUnassignReferee={handleUnassignReferee}
          onAssignRefereeClick={(match) => {
            setSelectedMatchForReferee(match)
            setShowAssignReferee(true)
          }}
        />
      </div>

      {/* Auto Schedule Modal */}
      <Dialog open={showAutoSchedule} onOpenChange={setShowAutoSchedule}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              {t("scheduling.autoScheduleForm.title", {
                defaultValue: "Auto Schedule & Court Optimization",
              })}
            </DialogTitle>
            <DialogDescription>
              {t("scheduling.autoScheduleForm.description", {
                defaultValue:
                  "The system will calculate and allocate matches into empty courts and optimal time slots.",
              })}
            </DialogDescription>
          </DialogHeader>
          <AutoScheduleDialogForm
            tournamentId={tournamentId}
            events={events}
            courtsList={courtsList}
            onClose={() => setShowAutoSchedule(false)}
            onApplied={() => {
              setShowAutoSchedule(false)
              loadSchedule()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Assign Referee Modal */}
      <Dialog open={showAssignReferee} onOpenChange={setShowAssignReferee}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {t("scheduling.referee.modalTitle", {
                defaultValue: "Assign Chief Referee",
              })}
            </DialogTitle>
            <DialogDescription>
              {t("scheduling.referee.modalDesc", {
                defaultValue:
                  "Enter information of the referee assigned to be in charge of this match.",
              })}
            </DialogDescription>
          </DialogHeader>
          <RefereeAssignmentForm
            onSubmit={handleAssignRefereeSubmit}
            onClose={() => setShowAssignReferee(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Manual Schedule Modal */}
      <Dialog open={showManualSchedule} onOpenChange={setShowManualSchedule}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {t("scheduling.manual.modalTitle", {
                defaultValue: "Manual Match Scheduling",
              })}
            </DialogTitle>
            <DialogDescription>
              {t("scheduling.manual.modalDesc", {
                defaultValue: "Select Court and Match Time for: ",
              })}
              <span className="font-semibold text-emerald-700">
                {selectedMatchForManual &&
                  `${getTeamName(selectedMatchForManual.team1)} vs ${getTeamName(selectedMatchForManual.team2)}`}
              </span>
            </DialogDescription>
          </DialogHeader>
          <ManualScheduleForm
            courtsList={courtsList}
            timeSlots={defaultTimeSlots}
            onSubmit={handleManualScheduleSubmit}
            onClose={() => setShowManualSchedule(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
