"use client"

import { useEffect } from "react"

import { useCourtScheduleStore } from "../../stores/court-schedule-store"
import { CourtSchedule } from "./court-schedule"

type CourtScheduleWrapperProps = {
  ownerMode?: boolean
  centerId?: string
}

export function CourtScheduleWrapper({
  ownerMode = false,
  centerId,
}: CourtScheduleWrapperProps) {
  const sportCenters = useCourtScheduleStore((s) => s.sportCenters)
  const selectedCenterId = useCourtScheduleStore((s) => s.centerId)
  const fetchSportCenters = useCourtScheduleStore((s) => s.fetchSportCenters)

  useEffect(() => {
    // ensure sport centers are loaded so selection state is accurate
    if (!sportCenters || sportCenters.length === 0) fetchSportCenters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeCenterId = centerId ?? selectedCenterId
  const selectedCenter = sportCenters.find((c) => c.id === activeCenterId)

  if (!selectedCenter) {
    return (
      <div className="rounded-md border border-border bg-background p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Vui lòng chọn sân bạn quản lý để xem lịch và đặt sân.
        </p>
      </div>
    )
  }

  return <CourtSchedule ownerMode={ownerMode} />
}
