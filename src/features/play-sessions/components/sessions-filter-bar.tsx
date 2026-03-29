"use client"

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export type DateTimeFilter = "today" | "all" | "past" | "future"

export type SessionStatusFilter =
  | "ALL"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"

interface SessionsFilterBarProps {
  nameKeyword: string
  statusFilter: SessionStatusFilter
  onNameKeywordChange: (value: string) => void
  onStatusFilterChange: (value: SessionStatusFilter) => void
}

export function SessionsFilterBar({
  nameKeyword,
  statusFilter,
  onNameKeywordChange,
  onStatusFilterChange,
}: SessionsFilterBarProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="relative md:col-span-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={nameKeyword}
          onChange={(event) => onNameKeywordChange(event.target.value)}
          placeholder="Tìm kiếm"
          className="pl-9"
          aria-label="Tìm kiếm"
        />
      </div>

      <NativeSelect
        value={statusFilter}
        onChange={(event) =>
          onStatusFilterChange(event.target.value as SessionStatusFilter)
        }
        aria-label="Filter sessions by status"
        className="w-full"
      >
        <NativeSelectOption value="ALL">Tất cả trạng thái</NativeSelectOption>
        <NativeSelectOption value="SCHEDULED">Lên lịch</NativeSelectOption>
        <NativeSelectOption value="IN_PROGRESS">
          Đang diễn ra
        </NativeSelectOption>
        <NativeSelectOption value="COMPLETED">Hoàn thành</NativeSelectOption>
        <NativeSelectOption value="CANCELLED">Đã hủy</NativeSelectOption>
      </NativeSelect>
    </div>
  )
}

export default SessionsFilterBar
