"use client"

import type { Booking } from "../../../types/booking"
import type { BookingCreatedAtFilter } from "../booking-list.utils"
import { BookingFilters } from "./booking-filters"

interface BookingListFiltersPanelProps {
  createdAtFilter: BookingCreatedAtFilter
  statusFilter: "all" | Booking["status"]
  onCreatedAtFilterChange: (value: BookingCreatedAtFilter) => void
  onStatusFilterChange: (value: "all" | Booking["status"]) => void
  onResetFilters: () => void
}

export function BookingListFiltersPanel({
  createdAtFilter,
  statusFilter,
  onCreatedAtFilterChange,
  onStatusFilterChange,
  onResetFilters,
}: BookingListFiltersPanelProps) {
  return (
    <div className="sticky top-4 z-30 -mx-1">
      <div className="space-y-4 rounded-3xl border bg-background/95 p-4 shadow-lg shadow-slate-950/5 backdrop-blur supports-backdrop-filter:bg-background/85 sm:p-5">
        <BookingFilters
          createdAtFilter={createdAtFilter}
          statusFilter={statusFilter}
          onCreatedAtFilterChange={onCreatedAtFilterChange}
          onStatusFilterChange={onStatusFilterChange}
          onResetFilters={onResetFilters}
        />
      </div>
    </div>
  )
}
