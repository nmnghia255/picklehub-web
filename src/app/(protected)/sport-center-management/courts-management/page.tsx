"use client"
import { CourtSchedule } from "../../../../features/sport-center-management/components/CourtSchedule"

export default function Page() {
  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quản lý sân</h1>
      </header>

      <CourtSchedule />
    </div>
  )
}
