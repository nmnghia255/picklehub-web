"use client"

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export type DateTimeFilter = "today" | "all" | "past" | "future"

export type SessionStatusFilter =
  | "ALL"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"

interface SessionsFilterBarProps {
  statusFilter: SessionStatusFilter
  onStatusFilterChange: (value: SessionStatusFilter) => void
}

export function SessionsFilterBar({
  statusFilter,
  onStatusFilterChange,
}: SessionsFilterBarProps) {
  return (
    <NativeSelect
      value={statusFilter}
      onChange={(event) =>
        onStatusFilterChange(event.target.value as SessionStatusFilter)
      }
      aria-label="Filter sessions by status"
      className="w-full"
    >
      <NativeSelectOption value="ALL">Tất cả</NativeSelectOption>
      <NativeSelectOption value="SCHEDULED">Lên lịch</NativeSelectOption>
      <NativeSelectOption value="IN_PROGRESS">Đang diễn ra</NativeSelectOption>
      <NativeSelectOption value="COMPLETED">Hoàn thành</NativeSelectOption>
      <NativeSelectOption value="CANCELLED">Đã hủy</NativeSelectOption>
    </NativeSelect>
  )
}

export default SessionsFilterBar
