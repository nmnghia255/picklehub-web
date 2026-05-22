"use client"

import {
  CalendarDays,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  type CourtOption,
  formatDateRangeLabel,
  type ReservationStatus,
} from "../../../../app/(protected)/sport-center-management/reservation-management/mock-data"

interface ReservationFiltersProps {
  search: string
  statusFilter: "all" | ReservationStatus
  courtFilter: string
  sortBy: string
  dateRange: DateRange | undefined
  courts: CourtOption[]
  statusOptions: Array<{ value: "all" | ReservationStatus; label: string }>
  sortOptions: Array<{ value: string; label: string }>
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: "all" | ReservationStatus) => void
  onCourtFilterChange: (value: string) => void
  onSortChange: (value: string) => void
  onDateRangeChange: (value: DateRange | undefined) => void
  onReset: () => void
}

export function ReservationFilters({
  search,
  statusFilter,
  courtFilter,
  sortBy,
  dateRange,
  courts,
  statusOptions,
  sortOptions,
  onSearchChange,
  onStatusFilterChange,
  onCourtFilterChange,
  onSortChange,
  onDateRangeChange,
  onReset,
}: ReservationFiltersProps) {
  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
      <div className="relative xl:col-span-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search reservation, customer, phone, or notes"
          className="h-10 pl-9"
        />
      </div>

      <Select
        value={statusFilter}
        onValueChange={(value) =>
          onStatusFilterChange(value as "all" | ReservationStatus)
        }
      >
        <SelectTrigger className="h-10 w-full">
          <Filter className="size-4 text-muted-foreground" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={courtFilter} onValueChange={onCourtFilterChange}>
        <SelectTrigger className="h-10 w-full">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <SelectValue placeholder="Court" />
        </SelectTrigger>
        <SelectContent>
          {courts.map((court) => (
            <SelectItem key={court.value} value={court.value}>
              {court.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-10 justify-start gap-2 overflow-hidden text-left font-normal"
          >
            <CalendarDays className="size-4 text-muted-foreground" />
            <span className="truncate">
              {formatDateRangeLabel(dateRange ?? {})}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-3">
          <div className="space-y-3">
            <div className="rounded-2xl border bg-muted/30 p-2">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={1}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDateRangeChange(undefined)}
              >
                <X className="mr-2 size-4" />
                Clear
              </Button>
              <p className="text-xs text-muted-foreground">Mock range picker</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex gap-2 xl:col-span-1">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onReset}
          className="border"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
