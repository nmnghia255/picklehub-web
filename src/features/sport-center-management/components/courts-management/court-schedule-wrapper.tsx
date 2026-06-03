"use client"

import { useEffect } from "react"

import { useCourtScheduleStore } from "../../stores/court-schedule-store"
import { CourtSchedule } from "./court-schedule"
import { Filters } from "./filters"

type CourtScheduleWrapperProps = {
  ownerMode?: boolean
}

export function CourtScheduleWrapper({
  ownerMode = false,
}: CourtScheduleWrapperProps) {
  const sportCenters = useCourtScheduleStore((s) => s.sportCenters)
  const fetchSportCenters = useCourtScheduleStore((s) => s.fetchSportCenters)

  const { courts, date, courtFilter, setDate, setCourtFilter } =
    useCourtScheduleStore()

  useEffect(() => {
    // ensure sport centers are loaded so selection state is accurate
    if (!sportCenters || sportCenters.length === 0) fetchSportCenters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mt-4 w-full min-w-0 gap-0 overflow-hidden">
      <Filters
        date={date}
        setDate={setDate}
        courtFilter={courtFilter}
        setCourtFilter={setCourtFilter}
        courts={courts}
      />

      <CourtSchedule ownerMode={ownerMode} />
    </div>
  )
}
