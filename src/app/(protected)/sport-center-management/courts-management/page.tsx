"use client"

import { CourtScheduleWrapper } from "@/features/sport-center-management/components/courts-management/court-schedule-wrapper"

export default function Page() {
  return (
    <div className="flex flex-col overflow-hidden p-6">
      <header className="flex shrink-0 items-center pb-4">
        <h1 className="text-2xl font-semibold">Quản lý sân</h1>
      </header>

      <CourtScheduleWrapper ownerMode={true} />
    </div>
  )
}
