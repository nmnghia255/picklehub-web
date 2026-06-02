"use client"

import { CourtScheduleWrapper } from "@/features/sport-center-management/components/courts-management/court-schedule-wrapper"

export default function Page() {
  return (
    <div className="flex h-screen flex-col gap-0 overflow-hidden p-6">
      <header className="flex shrink-0 items-center justify-between pb-4">
        <h1 className="text-2xl font-semibold">Quản lý sân</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        <CourtScheduleWrapper ownerMode={true} />
      </div>
    </div>
  )
}
