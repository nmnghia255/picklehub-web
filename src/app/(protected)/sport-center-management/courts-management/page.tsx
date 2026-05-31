"use client"

import { CourtScheduleWrapper } from "../../../../features/sport-center-management/components/courts-management/court-schedule-wrapper"
import { SportCenterSelector } from "../../../../features/sport-center-management/components/courts-management/sport-center-selector"
import { useCourtScheduleStore } from "../../../../features/sport-center-management/stores/court-schedule-store"

export default function Page() {
  const centerId = useCourtScheduleStore((state) => state.centerId)

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quản lý sân</h1>
        <SportCenterSelector />
      </header>

      <CourtScheduleWrapper ownerMode={true} centerId={centerId} />
    </div>
  )
}
