"use client"

import { MapPin } from "lucide-react"

import type { TournamentBooking } from "../../types/booking"
import type { TournamentSchedule } from "../../types/schedule"
import type { CourtInfo } from "../../types/tournament-court"
import { EmptySlot } from "./empty-slot"
import { MatchCard } from "./match-card"

interface CourtRowProps {
  courtObj: CourtInfo
  timeSlots: string[]
  bookings: TournamentBooking[]
  scheduledMatches: TournamentSchedule[]
  previewMatches: TournamentSchedule[]
  isPreviewMode: boolean
  activeDragCell: { courtId: string; time: string } | null
  onDragStart: (
    e: React.DragEvent,
    matchId: string | number,
    duration: number
  ) => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnter: (e: React.DragEvent, courtId: string, time: string) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, courtId: string, time: string) => void
  onUnschedule: (fixtureId: string) => void
  onUnassignReferee: (fixtureId: string) => void
  onAssignRefereeClick: (match: TournamentSchedule) => void
  onEmptySlotClick?: (
    courtId: string,
    courtName: string,
    timeSlot: string
  ) => void
  formatTimeSlot: (timeStr: string | null | undefined) => string
}

export function CourtRow({
  courtObj,
  timeSlots,
  bookings,
  scheduledMatches,
  previewMatches,
  isPreviewMode,
  activeDragCell,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onUnschedule,
  onUnassignReferee,
  onAssignRefereeClick,
  onEmptySlotClick,
  formatTimeSlot,
}: CourtRowProps) {
  return (
    <div className="flex min-h-24">
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
              const endSlotIdx = endIdx !== -1 ? endIdx : timeSlots.length
              return currentIndex >= startIdx && currentIndex < endSlotIdx
            })

          // Find if there's a match scheduled on this court starting at this time slot
          const match = scheduledMatches.find((m) => {
            if (m.courtId !== courtObj.courtId) return false
            return formatTimeSlot(m.startTime) === time
          })

          // Find if there's a preview match allocated on this court starting at this time slot
          const previewMatch = !match
            ? previewMatches.find((m) => {
                if (m.courtId !== courtObj.courtId) return false
                return formatTimeSlot(m.startTime) === time
              })
            : undefined

          const activeMatch = (match ||
            (previewMatch
              ? { ...previewMatch, isPreview: true }
              : undefined)) as
            | (TournamentSchedule & { isPreview?: boolean })
            | undefined

          if (activeMatch) {
            return (
              <MatchCard
                key={time}
                activeMatch={activeMatch}
                isPreviewMode={isPreviewMode}
                matchWidth={96}
                onDragStart={onDragStart}
                onUnschedule={onUnschedule}
                onUnassignReferee={onUnassignReferee}
                onAssignRefereeClick={onAssignRefereeClick}
                formatTimeSlot={formatTimeSlot}
              />
            )
          }

          return (
            <div
              key={time}
              className="relative w-24 shrink-0 border-r border-dashed border-gray-200 px-0.5"
            >
              <EmptySlot
                courtId={courtObj.courtId}
                courtName={courtObj.courtName}
                time={time}
                isSlotBooked={isSlotBooked}
                activeDragCell={activeDragCell}
                onDragOver={onDragOver}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onEmptySlotClick={onEmptySlotClick}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
