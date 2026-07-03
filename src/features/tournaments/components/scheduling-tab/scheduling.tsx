"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { executeAutoScheduleAction } from "../../actions/schedule-actions"
import {
  useAutoScheduleConfig,
  useBookings,
  useCenters,
  useCourtsList,
  useIsPreviewMode,
  usePreviewAssignments,
  usePreviewEventId,
  useScheduledMatches,
  useSchedulingStore,
  useSelectedCenterId,
  useSetViewMode,
  useUnscheduledMatches,
  useUpdatePreviewAssignment,
  useViewMode,
} from "../../stores/use-scheduling-store"
import type { TournamentBooking } from "../../types/booking"
import type { Match } from "../../types/match"
import type { Tournament } from "../../types/tournament"
import type { TournamentEvent } from "../../types/tournament-event"
import { AutoScheduleDialog } from "./auto-schedule-dialog"
import { ManualScheduleDialog } from "./manual-schedule-dialog"
import { PreviewBanner } from "./preview-banner"
import { RefereeAssignmentDialog } from "./referee-assignment-dialog"
import { SchedulingToolbar } from "./scheduling-toolbar"
import { SlotScheduleDialog } from "./slot-schedule-dialog"
import { TimelineGrid } from "./timeline-grid"

// Timezone-safe local date comparison helper
const isSameLocalDate = (
  timeStr: string | null | undefined,
  targetDateStr: string
): boolean => {
  if (!timeStr) return false
  if (timeStr.includes("T")) {
    if (
      timeStr.includes("Z") ||
      timeStr.includes("+") ||
      (timeStr.includes("-") && timeStr.split("T")[1].includes("-"))
    ) {
      try {
        const d = new Date(timeStr)
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, "0")
          const day = String(d.getDate()).padStart(2, "0")
          return `${year}-${month}-${day}` === targetDateStr
        }
      } catch (e) {
        console.error("Error parsing local date:", e)
      }
    }
    return timeStr.split("T")[0] === targetDateStr
  }
  return timeStr.startsWith(targetDateStr)
}

// Helper function to generate time slots dynamically from bookings on the selected date
const generateTimeSlots = (
  bookings: TournamentBooking[],
  selectedDate: string,
  defaultSlots: string[]
): string[] => {
  const activeBookings = bookings.filter(
    (b) =>
      b.date &&
      (b.date.startsWith(selectedDate) ||
        b.date.split("T")[0] === selectedDate) &&
      b.statusMirror.toUpperCase() !== "CANCELLED" &&
      b.statusMirror.toUpperCase() !== "EXPIRED"
  )

  const items = activeBookings.flatMap((b) => b.items || [])
  const startTimes = items.map((it) => it.startTime).filter(Boolean)
  const endTimes = items.map((it) => it.endTime).filter(Boolean)

  if (startTimes.length === 0 || endTimes.length === 0) {
    return defaultSlots
  }

  try {
    const timeToMinutes = (t: string): number => {
      const [h, m] = t.split(":").map(Number)
      return h * 60 + m
    }
    const minutesToTime = (m: number): string => {
      const h = Math.floor(m / 60)
      const mins = m % 60
      return `${String(h).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
    }

    const minMinutes = Math.min(...startTimes.map(timeToMinutes))
    const maxMinutes = Math.max(...endTimes.map(timeToMinutes))

    const slots: string[] = []
    for (let m = minMinutes; m < maxMinutes; m += 30) {
      slots.push(minutesToTime(m))
    }
    return slots
  } catch (e) {
    console.error("Failed to generate dynamic time slots:", e)
    return defaultSlots
  }
}

// Default time slots to display in grid (normalized to HH:MM format)
const defaultTimeSlots = [
  "06:00",
  "06:30",
  "07:00",
  "07:30",
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
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
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

export function Scheduling({
  tournamentId,
  events,
  tournament,
}: SchedulingProps) {
  const { t, i18n } = useTournamentTranslation()
  const [slotToSchedule, setSlotToSchedule] = useState<{
    courtId: string
    courtName: string
    timeSlot: string
  } | null>(null)

  // Generate dates range from tournament
  const dates = getDatesRange(tournament.startDate, tournament.endDate)

  // Zustand Store states
  const setTournamentId = useSchedulingStore((s) => s.setTournamentId)
  const setEvents = useSchedulingStore((s) => s.setEvents)
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

  const [isConfirmingAutoSchedule, setIsConfirmingAutoSchedule] =
    useState(false)

  // Preview state hooks
  const isPreviewMode = useIsPreviewMode()
  const previewAssignments = usePreviewAssignments()
  const autoScheduleConfig = useAutoScheduleConfig()
  const previewEventId = usePreviewEventId()
  const clearPreview = useSchedulingStore((s) => s.clearPreview)
  const updatePreviewAssignment = useUpdatePreviewAssignment()
  const viewMode = useViewMode()
  const setViewMode = useSetViewMode()
  const fixtures = useSchedulingStore((s) => s.fixtures)

  // Computed selector hooks
  const unscheduledMatches = useUnscheduledMatches()
  const scheduledMatches = useScheduledMatches()
  const courtsList = useCourtsList()
  const bookings = useBookings()
  const centers = useCenters()
  const selectedCenterId = useSelectedCenterId()
  const setSelectedCenterId = useSchedulingStore((s) => s.setSelectedCenterId)

  // Dynamically resolve preview assignments into Match objects
  const previewMatches = useMemo(() => {
    if (
      !isPreviewMode ||
      !previewAssignments ||
      previewAssignments.length === 0
    ) {
      return []
    }
    return previewAssignments
      .map((pa) => {
        const match = fixtures.find(
          (f) =>
            f.id === pa.matchId || f.id.toString() === pa.matchId.toString()
        )

        // Find the friendly court name from bookings
        let courtDisplay = pa.courtName
        const booking = bookings.find((b) => b.id === pa.bookingId)
        if (booking && booking.items) {
          const item = booking.items.find((it) => it.id === pa.bookingItemId)
          if (item && item.court?.name) {
            courtDisplay = item.court.name
          }
        }

        const startIso = `${pa.date}T${pa.startTime}`

        let duration = 45
        try {
          const startParts = pa.startTime.split(":")
          const endParts = pa.endTime.split(":")
          if (startParts.length >= 2 && endParts.length >= 2) {
            const startMin = Number(startParts[0]) * 60 + Number(startParts[1])
            const endMin = Number(endParts[0]) * 60 + Number(endParts[1])
            duration = endMin - startMin
          }
        } catch (e) {
          console.error("Error computing duration:", e)
        }

        const team1 = match?.team1 || { name: pa.team1Name || "TBD" }
        const team2 = match?.team2 || { name: pa.team2Name || "TBD" }
        const event = match?.event || ""
        const round = match?.round || pa.round || ""

        return {
          id: pa.matchId,
          tournamentId: tournamentId,
          eventId: match?.eventId || 0,
          event,
          round,
          team1,
          team2,
          winner: match?.winner || null,
          score: match?.score || null,
          status: match?.status || "pending",
          court: courtDisplay,
          courtId: pa.courtName, // GUID
          startTime: startIso,
          duration,
          priority: match?.priority || "medium",
          refereeId: match?.refereeId,
          refereeName: match?.refereeName,
          bookingId: pa.bookingId,
          bookingItemId: pa.bookingItemId,
          warnings: match?.warnings || [],
          isPreview: true,
        }
      })
      .filter(Boolean) as Match[]
  }, [isPreviewMode, previewAssignments, fixtures, bookings, tournamentId])

  const handleConfirmAutoSchedule = async () => {
    if (!previewEventId || !autoScheduleConfig) {
      toast.error("No active auto-schedule configuration found.")
      return
    }

    setIsConfirmingAutoSchedule(true)
    try {
      const res = await executeAutoScheduleAction(
        tournamentId,
        previewEventId,
        autoScheduleConfig
      )

      if (res.success) {
        toast.success(
          t("scheduling.toasts.executeSuccess", {
            defaultValue: "Schedule applied and notifications sent to players!",
          })
        )
        clearPreview()
        await loadSchedule()
      } else {
        toast.error(
          res.error ||
            t("scheduling.toasts.executeFailed", {
              defaultValue: "Failed to execute auto-schedule",
            })
        )
      }
    } catch (err) {
      console.error("Error executing auto-schedule:", err)
      toast.error("Failed to execute auto-schedule due to an unexpected error.")
    } finally {
      setIsConfirmingAutoSchedule(false)
    }
  }

  // Generate time slots dynamically from the bookings on the selected date
  const dynamicTimeSlots = generateTimeSlots(
    bookings,
    selectedDate,
    defaultTimeSlots
  )

  // Find earliest start time and latest end time of the booked slots
  const { earliestTime, latestTime } = useMemo(() => {
    const activeBookings = bookings.filter(
      (b) =>
        b.date &&
        (b.date.startsWith(selectedDate) ||
          b.date.split("T")[0] === selectedDate) &&
        b.statusMirror.toUpperCase() !== "CANCELLED" &&
        b.statusMirror.toUpperCase() !== "EXPIRED"
    )

    const items = activeBookings.flatMap((b) => b.items || [])
    if (items.length === 0) {
      return { earliestTime: "08:00", latestTime: "20:00" }
    }

    const formatTime = (timeStr: string | null | undefined): string => {
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

    const startTimes = items
      .map((it) => formatTime(it.startTime))
      .filter(Boolean)
    const endTimes = items.map((it) => formatTime(it.endTime)).filter(Boolean)

    const minStart =
      startTimes.length > 0
        ? startTimes.reduce((min, t) => (t < min ? t : min), startTimes[0])
        : "08:00"
    const maxEnd =
      endTimes.length > 0
        ? endTimes.reduce((max, t) => (t > max ? t : max), endTimes[0])
        : "20:00"

    return { earliestTime: minStart, latestTime: maxEnd }
  }, [bookings, selectedDate])

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
    setEvents(events)
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
    events,
    setTournamentId,
    setEvents,
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

  const handleAssignRefereeSubmit = async (refereeId: string) => {
    const res = await assignReferee(refereeId)
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
    courtId: string,
    timeSlot: string
  ) => {
    const res = await manualSchedule(courtId, timeSlot)
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

  const handleMovePreviewMatch = (
    matchId: string,
    courtId: string,
    startTimeSlot: string,
    durationMin: number
  ) => {
    // Find the booking item at the drop location
    let foundBookingId: number | null = null
    let foundBookingItemId: string | null = null

    for (const booking of bookings) {
      if (booking.centerId !== selectedCenterId) continue
      if (!booking.date) continue

      const bDate = booking.date.split("T")[0]
      if (bDate !== selectedDate) continue

      if (
        booking.statusMirror.toUpperCase() === "CANCELLED" ||
        booking.statusMirror.toUpperCase() === "EXPIRED"
      ) {
        continue
      }

      if (booking.items) {
        const item = booking.items.find((it) => {
          if (it.courtId !== courtId) return false
          const startNorm = it.startTime.substring(0, 5)
          const endNorm = it.endTime.substring(0, 5)

          const timeToMinutes = (t: string): number => {
            const [h, m] = t.split(":").map(Number)
            return h * 60 + m
          }
          const targetMin = timeToMinutes(startTimeSlot)
          const startMin = timeToMinutes(startNorm)
          const endMin = timeToMinutes(endNorm)

          return targetMin >= startMin && targetMin < endMin
        })

        if (item) {
          foundBookingId = booking.id
          foundBookingItemId = item.id
          break
        }
      }
    }

    if (!foundBookingId || !foundBookingItemId) {
      toast.error(
        t("scheduling.toasts.noBookingItemAtSlot", {
          defaultValue: "No booking item covers this slot.",
        })
      )
      return
    }

    // Calculate new endTime based on duration
    const addMinutesToTime = (timeStr: string, mins: number): string => {
      const [h, m] = timeStr.split(":").map(Number)
      const totalMins = h * 60 + m + mins
      const newH = Math.floor(totalMins / 60) % 24
      const newM = totalMins % 60
      return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`
    }
    const newEndTime = addMinutesToTime(startTimeSlot, durationMin)

    // Update store state
    updatePreviewAssignment(matchId, {
      bookingId: foundBookingId,
      bookingItemId: foundBookingItemId,
      courtName: courtId,
      startTime: startTimeSlot,
      endTime: newEndTime,
    })

    toast.success(
      t("scheduling.toasts.previewMoveSuccess", {
        defaultValue: "Preview assignment updated!",
      })
    )
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
      {/* Main Timeline */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-50">
        {/* Top Header */}
        <SchedulingToolbar
          dates={dates}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          formatDateValue={formatDateValue}
          centers={centers}
          selectedCenterId={selectedCenterId}
          setSelectedCenterId={setSelectedCenterId}
          events={events}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
          onReload={loadSchedule}
          onAutoSchedule={() => setShowAutoSchedule(true)}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          hasPreview={isPreviewMode}
        />

        {/* Auto-Schedule Preview Banner */}
        {isPreviewMode && (
          <PreviewBanner
            previewMatchesCount={previewMatches.length}
            isConfirming={isConfirmingAutoSchedule}
            onAdjustConfig={() => setShowAutoSchedule(true)}
            onCancelPreview={clearPreview}
            onConfirmPreview={handleConfirmAutoSchedule}
          />
        )}

        {/* Timeline Grid */}
        <TimelineGrid
          courtsList={courtsList}
          timeSlots={dynamicTimeSlots}
          scheduledMatches={scheduledMatches.filter((m) =>
            isSameLocalDate(m.startTime, selectedDate)
          )}
          previewMatches={
            viewMode === "preview"
              ? previewMatches.filter((m) =>
                  isSameLocalDate(m.startTime, selectedDate)
                )
              : []
          }
          bookings={bookings}
          isPreviewMode={viewMode === "preview"}
          onUnschedule={handleUnschedule}
          onUnassignReferee={handleUnassignReferee}
          onAssignRefereeClick={(match) => {
            setSelectedMatchForReferee(match)
            setShowAssignReferee(true)
          }}
          onEmptySlotClick={(courtId, courtName, timeSlot) =>
            setSlotToSchedule({ courtId, courtName, timeSlot })
          }
          onMovePreviewMatch={handleMovePreviewMatch}
        />
      </div>

      {/* Auto Schedule Modal */}
      <AutoScheduleDialog
        open={showAutoSchedule}
        onOpenChange={setShowAutoSchedule}
        tournamentId={tournamentId}
        events={events}
        earliestTime={earliestTime}
        latestTime={latestTime}
        onApplied={() => {
          setShowAutoSchedule(false)
          loadSchedule()
        }}
      />

      {/* Assign Referee Modal */}
      <RefereeAssignmentDialog
        open={showAssignReferee}
        onOpenChange={setShowAssignReferee}
        onSubmit={handleAssignRefereeSubmit}
      />

      {/* Manual Schedule Modal */}
      <ManualScheduleDialog
        open={showManualSchedule}
        onOpenChange={setShowManualSchedule}
        selectedMatch={selectedMatchForManual}
        courtsList={courtsList}
        timeSlots={dynamicTimeSlots}
        onSubmit={handleManualScheduleSubmit}
      />

      {/* Schedule Match to Empty Slot Modal */}
      <SlotScheduleDialog
        open={!!slotToSchedule}
        onOpenChange={(open) => !open && setSlotToSchedule(null)}
        slotToSchedule={slotToSchedule}
        unscheduledMatches={unscheduledMatches}
        setSelectedMatchForManual={setSelectedMatchForManual}
        manualSchedule={manualSchedule}
      />
    </div>
  )
}
