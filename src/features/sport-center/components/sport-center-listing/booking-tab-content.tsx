"use client"

import { EmptyState } from "@/features/sport-center/components/sport-center-listing/empty-state"
import { SportCenterCard } from "@/features/sport-center/components/sport-center-listing/sport-center-card"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

interface BookingTabContentProps {
  bookedSportCenters: SportCenter[]
}

export function BookingTabContent({
  bookedSportCenters,
}: BookingTabContentProps) {
  return bookedSportCenters.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {bookedSportCenters.map((sportCenter) => (
        <SportCenterCard key={sportCenter.id} sportCenter={sportCenter} />
      ))}
    </div>
  ) : (
    <EmptyState variant="booking" />
  )
}
