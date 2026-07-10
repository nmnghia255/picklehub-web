"use client"

import { useState } from "react"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import type { TournamentBooking } from "../../types/booking"
import type { TournamentSchedule } from "../../types/schedule"
import type { CourtInfo } from "../../types/tournament-court"
import { CourtRow } from "./court-row"
import { NoCourtsView } from "./no-courts-view"
import { TimeHeader } from "./time-header"

interface TimelineGridProps {
  courtsList: CourtInfo[]
  timeSlots: string[]
  scheduledMatches: TournamentSchedule[]
  previewMatches?: TournamentSchedule[]
  bookings: TournamentBooking[]
  isPreviewMode?: boolean
  onUnschedule: (fixtureId: string) => void
  onUnschedulePreview?: (matchId: string) => void
  onUnassignReferee: (fixtureId: string) => void
  onAssignRefereeClick: (match: TournamentSchedule) => void
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
  // Always extract HH:MM directly from the string's time component (before any timezone offset).
  // Using new Date().getHours() would convert to the browser's local timezone, which can differ
  // from the venue timezone embedded in the ISO string and cause matches to appear in wrong slots.
  const formatTimeSlot = (timeStr: string | null | undefined): string => {
    if (!timeStr) return ""
    if (timeStr.includes("T")) {
      // Extract the time portion after "T", strip any timezone suffix (+HH:MM, -HH:MM, or Z)
      const timePart = timeStr.split("T")[1]
      const timeOnly = timePart.replace(/([+-]\d{2}:\d{2}|Z).*$/, "")
      const parts = timeOnly.split(":")
      if (parts.length >= 2) {
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`
      }
    }
    if (timeStr.includes(":")) {
      const parts = timeStr.split(":")
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`
    }
    return timeStr
  }

  if (courtsList.length === 0) {
    return <NoCourtsView />
  }

  return (
    <ScrollArea className="min-h-0 w-full flex-1">
      <div className="p-6">
        <div className="inline-block min-w-full">
          <TimeHeader timeSlots={timeSlots} />

          <div className="space-y-4">
            {courtsList.map((courtObj) => (
              <CourtRow
                key={courtObj.courtId}
                courtObj={courtObj}
                timeSlots={timeSlots}
                bookings={bookings}
                scheduledMatches={scheduledMatches}
                previewMatches={previewMatches}
                isPreviewMode={isPreviewMode}
                activeDragCell={activeDragCell}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onUnschedule={onUnschedule}
                onUnassignReferee={onUnassignReferee}
                onAssignRefereeClick={onAssignRefereeClick}
                onEmptySlotClick={onEmptySlotClick}
                formatTimeSlot={formatTimeSlot}
              />
            ))}
          </div>
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
