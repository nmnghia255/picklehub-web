"use client"

import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

interface EmptySlotProps {
  courtId: string
  courtName: string
  time: string
  isSlotBooked: boolean
  activeDragCell: { courtId: string; time: string } | null
  onDragOver: (e: React.DragEvent) => void
  onDragEnter: (e: React.DragEvent, courtId: string, time: string) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, courtId: string, time: string) => void
  onEmptySlotClick?: (
    courtId: string,
    courtName: string,
    timeSlot: string
  ) => void
}

export function EmptySlot({
  courtId,
  courtName,
  time,
  isSlotBooked,
  activeDragCell,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onEmptySlotClick,
}: EmptySlotProps) {
  const { t } = useTournamentTranslation()

  if (isSlotBooked) {
    return (
      <div
        onDragOver={onDragOver}
        onDragEnter={(e) => onDragEnter(e, courtId, time)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, courtId, time)}
        className={`h-full min-h-20 cursor-pointer rounded border border-dashed transition-all duration-200 ${
          activeDragCell?.courtId === courtId && activeDragCell?.time === time
            ? "scale-102 border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400"
            : "border-gray-200 bg-white/40 hover:border-emerald-400 hover:bg-emerald-50/40"
        }`}
        onClick={() => onEmptySlotClick?.(courtId, courtName, time)}
      />
    )
  }

  return (
    <div
      className="h-full min-h-20 cursor-not-allowed rounded border border-gray-200/50 bg-gray-100/50"
      title={t("scheduling.grid.unavailableSlot", {
        defaultValue: "Slot not booked",
      })}
    />
  )
}
